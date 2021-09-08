'use strict'

// log on files
const logger = require('console-files')
// get store and order ID from local database based on PagHiper transaction code
const { get } = require(process.cwd() + '/lib/database')
// read configured E-Com Plus app data
const getConfig = require(process.cwd() + '/lib/store-api/get-config')
// update order transaction status on Store API
const updatePaymentStatus = require(process.cwd() + '/lib/store-api/update-payment-status')
// list orders from E-Com Plus Store API searching by transaction code
const listOrdersByTransaction = require(process.cwd() + '/lib/store-api/list-orders-by-transaction')
// read full notification body from PagHiper API
const readNotification = require(process.cwd() + '/lib/paghiper-api/read-notification')
// get intermediator object from payment gateway object
const { intermediator } = require(process.cwd() + '/lib/new-payment-gateway')()

const CLIENT_ERR = 'invalidClient'

module.exports = appSdk => {
  return (req, res) => {
    const { body } = req
    const isPix = Boolean(req.params.pix)
    // handle PagHiper notification request
    // https://dev.paghiper.com/reference#qq
    const transactionCode = (body && body.transaction_id)
    if (!transactionCode) {
      return res.sendStatus(400)
    }
    logger.log(`Paghiper notification for ${transactionCode}`)

    const handleNotification = isRetry => {
      // declare reusable Store API authentication object and Store ID
      let sdkClient, storeId
      // get Store ID first
      get(transactionCode)
        .then(data => {
          storeId = data.storeId
          // logger.log(storeId)
          // pre-authenticate to reuse auth object
          return appSdk.getAuth(storeId)
        })

        .then(auth => {
          sdkClient = { appSdk, storeId, auth }
          // get app configured options
          // including hidden (authenticated) data
          return getConfig(sdkClient, true)
        })

        .then(config => {
          if (config.paghiper_token && config.paghiper_api_key === body.apiKey) {
            // list order IDs for respective transaction code
            return listOrdersByTransaction(sdkClient, transactionCode, intermediator.code)
              .then(orders => ({ orders, config }))
          } else {
            const err = new Error('API key does not match')
            err.name = CLIENT_ERR
            throw err
          }
        })

        .then(({ orders, config }) => {
          orders.forEach(({ _id }) => {
            logger.log(`#${storeId} ${_id} reading PagHiper notification`)
          })
          // read full notification body from PagHiper API
          return readNotification(Object.assign({}, body, {
            token: config.paghiper_token
          }), isPix)
            .then(paghiperResponse => ({ paghiperResponse, orders }))
        })

        .then(({ paghiperResponse, orders }) => {
          // we have full PagHiper notification object here
          // parse PagHiper status to E-Com Plus financial status
          let { status } = paghiperResponse.status_request
          logger.log(`PagHiper ${transactionCode} -> '${status}'`)
          switch (status) {
            case 'pending':
            case 'paid':
            case 'refunded':
              // is the same
              break

            case 'canceled':
              status = 'voided'
              break
            case 'processing':
              status = 'under_analysis'
              break
            case 'reserved':
              // https://atendimento.paghiper.com/hc/pt-br/articles/360016177713
              status = 'authorized'
              break

            default:
              // ignore unknow status
              return true
          }

          // change transaction status on E-Com Plus API
          const notificationCode = body.notification_id
          const promises = []
          orders.forEach(({ _id, transactions }) => {
            let transactionId
            if (transactions) {
              for (let i = 0; i < transactions.length; i++) {
                const transaction = transactions[i]
                const { intermediator } = transaction
                if (intermediator && intermediator.transaction_id === String(transactionCode)) {
                  if (transaction.status) {
                    if (
                      transaction.status.current === status ||
                      (status === 'pending' && transaction.status.current === 'paid')
                    ) {
                      // ignore old/duplicated notification
                      return
                    }
                  }
                  transactionId = transaction._id
                }
              }
            }
            promises.push(updatePaymentStatus(sdkClient, _id, status, notificationCode, transactionId))
          })
          return Promise.all(promises)
        })

        .then(() => {
          // Store API was changed with current transaction status
          // all done
          res.status(204)
          res.end()
        })

        .catch(err => {
          const { message, response } = err
          let statusCode
          if (!err.request && err.name !== CLIENT_ERR && err.code !== 'EMPTY') {
            // not Axios error ?
            logger.error(err)
            statusCode = 500
          } else {
            const resStatus = response && response.status
            let debugMsg = `[#${storeId} / ${transactionCode}] Unhandled notification: `
            if (err.config) {
              debugMsg += `${err.config.url} `
            }
            debugMsg += (resStatus || message)

            if (
              !isRetry &&
              ((resStatus === 401 && response.data && response.data.error_code === 132) || resStatus >= 500)
            ) {
              // delay and retry once
              setTimeout(() => {
                handleNotification(true)
              }, 7000)
              statusCode = 503
            } else {
              logger.log(debugMsg)
              statusCode = 409
            }
          }

          // return response with error
          res.status(statusCode)
          res.send({
            error: 'paghiper_notification_error',
            message
          })
        })
    }

    handleNotification()
  }
}
