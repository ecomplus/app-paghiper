'use strict'

// log on files
const logger = require('console-files')
// parse craete transaction body from Mods API to PagHiper model
const parseTransactionBody = require(process.cwd() + '/lib/parse-transaction-body')
// create new transaction to PagHiper API
const createTransaction = require(process.cwd() + '/lib/paghiper-api/create-transaction')

module.exports = appSdk => {
  return (req, res) => {
    const { storeId, body } = req
    // body was already pre-validated on @/bin/web.js
    // treat module request body
    const { params, application } = body
    // app configured options
    const config = Object.assign({}, application.data, application.hidden_data)

    // params object follows create transaction request schema:
    // https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
    const orderId = params.order_id
    logger.log(`> Create transaction for #${storeId} ${orderId}`)
    // setup transaction body to PagHiper reference
    // https://dev.paghiper.com/reference#gerar-boleto
    const paghiperTransaction = parseTransactionBody(params)
    const isPix = params.payment_method.code === 'account_deposit'
    if (isPix) {
      paghiperTransaction.notification_url += '/pix'
    }

    // use configured PagHiper API key
    paghiperTransaction.apiKey = config.paghiper_api_key
    // merge configured banking billet options
    const options = config.banking_billet_options
    if (typeof options === 'object' && options !== null) {
      // options must have only valid properties for PagHiper transaction object
      for (let prop in options) {
        if (options.hasOwnProperty(prop) && options[prop] !== null) {
          paghiperTransaction[prop] = options[prop]
        }
      }
    }

    // send request to PagHiper API
    createTransaction(paghiperTransaction, storeId, orderId, isPix)

      .then(createRequest => {
        // transaction created successfully
        // https://dev.paghiper.com/reference#exemplos
        // mount response body
        // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
        const transaction = {
          intermediator: {
            transaction_id: createRequest.transaction_id,
            transaction_code: createRequest.transaction_id,
            transaction_reference: createRequest.order_id
          },
          amount: createRequest.value_cents
            ? parseInt(createRequest.value_cents, 10) / 100
            // use amount from create transaction request body
            : params.amount.total
        }

        if (isPix) {
          // https://dev.paghiper.com/reference#exemplos-pix
          const pixCode = createRequest.pix_code
          transaction.intermediator.transaction_code = pixCode.emv
          const pixCodeUrls = ['pix_url', 'bacen_url', 'qrcode_image_url']
          for (let i = 0; i < pixCodeUrls.length; i++) {
            const pixUrl = pixCode[pixCodeUrls[i]]
            if (pixUrl && pixUrl.startsWith('http')) {
              transaction.payment_link = pixUrl
              break
            }
          }
          transaction.notes = `<img src="${pixCode.qrcode_image_url}" ` +
            'style="display:block;max-width:100%;margin:0 auto">'
        } else {
          const bankSlip = createRequest.bank_slip
          transaction.payment_link = bankSlip.url_slip
          transaction.banking_billet = {
            code: bankSlip.digitable_line,
            link: bankSlip.url_slip_pdf
          }
          if (createRequest.due_date) {
            transaction.banking_billet.valid_thru = new Date(createRequest.due_date).toISOString()
          }
        }

        // all done
        // send response and finish process
        res.send({ transaction })
      })

      .catch(err => {
        let { message } = err
        let statusCode
        if (!err.request) {
          // not Axios error ?
          logger.error(err)
          statusCode = 500
        } else {
          let debugMsg = `[#${storeId}] Can't create transaction: `
          if (err.config) {
            debugMsg += `${err.config.url} `
          }
          if (err.response) {
            debugMsg += err.response.status

            // https://dev.paghiper.com/reference#mensagens-de-retorno-2
            if (err.response.status === 200) {
              const { data } = err.response
              if (data) {
                debugMsg += ' ' +
                  (typeof data === 'object' ? JSON.stringify(data) : data) + ' ' +
                  JSON.stringify(paghiperTransaction)
                if (data.create_request && data.create_request.response_message) {
                  message = data.create_request.response_message
                }
              }
            }
          } else {
            debugMsg += message
          }
          logger.log(debugMsg)
          statusCode = 409
        }

        // return error status code
        res.status(statusCode)
        res.send({
          error: 'CREATE_TRANSACTION_ERR',
          message
        })
      })
  }
}
