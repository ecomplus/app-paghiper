'use strict'

// get store and order ID from local database based on PagHiper transaction code
const { get } = require(process.cwd() + '/lib/database')
// read configured E-Com Plus app data
const getConfig = require(process.cwd() + '/lib/store-api/get-config')
// update order transaction status on Store API
const updatePaymentStatus = require(process.cwd() + '/lib/store-api/update-payment-status')
// read full notification body from PagHiper API
const readNotification = require(process.cwd() + '/lib/paghiper-api/read-notification')

module.exports = appSdk => {
  return (req, res) => {
    const { body } = req
    // handle PagHiper notification request
    // https://dev.paghiper.com/reference#qq
    const transactionCode = (body && body.transaction_id)
    if (!transactionCode) {
      return res.sendStatus(400)
    }

    // declare reusable Store API authentication object and Store ID
    let sdkClient, storeId, orderId
    // get Store ID first
    get(transactionCode)

      .then(data => {
        storeId = data.storeId
        orderId = data.orderId
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
        const token = config.paghiper_token
        if (token && config.paghiper_api_key === body.apiKey) {
          // read full notification body from PagHiper API
          return readNotification(Object.assign({}, body, { token }))
        } else {
          throw new Error('API key does not match')
        }
      })

      .then(paghiperResponse => {
        // we have full PagHiper notification object here
        // parse PagHiper status to E-Com Plus financial status
        let { status } = paghiperResponse.status_request
        switch (status) {
          case 'pending':
          case 'paid':
          case 'refunded':
            // is the same
            break

          case 'completed':
            status = 'paid'
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
        const notificationCode = body.notification_code
        return updatePaymentStatus(sdkClient, orderId, status, notificationCode)
      })

      .then(() => {
        // Store API was changed with current transaction status
        // all done
        res.status(204)
        res.end()
      })

      .catch(err => {
        // return response with error
        res.status(500)
        let { message } = err
        res.send({
          error: 'paghiper_notification_error',
          message
        })
      })
  }
}
