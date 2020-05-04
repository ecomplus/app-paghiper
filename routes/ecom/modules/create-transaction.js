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
    // setup transaction body to PagHiper reference
    // https://dev.paghiper.com/reference#gerar-boleto
    const paghiperTransaction = parseTransactionBody(params)

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
    createTransaction(paghiperTransaction, storeId, orderId)

      .then(paghiperResponse => {
        // transaction created successfully
        // https://dev.paghiper.com/reference#exemplos
        const createRequest = paghiperResponse.create_request
        const bankSlip = createRequest.bank_slip

        // mount response body
        // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
        const transaction = {
          payment_link: bankSlip.url_slip,
          intermediator: {
            transaction_id: createRequest.transaction_id,
            transaction_code: createRequest.transaction_id,
            transaction_reference: createRequest.order_id
          },
          banking_billet: {
            code: bankSlip.digitable_line,
            link: bankSlip.url_slip_pdf
          },
          amount: createRequest.value_cents
            ? parseInt(createRequest.value_cents, 10) / 100
            // use amount from create transaction request body
            : params.amount.total
        }
        if (createRequest.due_date) {
          transaction.banking_billet.valid_thru = new Date(createRequest.due_date).toISOString()
        }

        // all done
        // send response and finish process
        res.send({ transaction })
      })

      .catch(err => {
        const { message } = err
        let statusCode
        if (!err.request) {
          // not Axios error ?
          logger.error(err)
          statusCode = 500
        } else {
          let debugMsg = `[#${storeId}] Can't create transaction: ${err.request.url} `
          if (err.response) {
            debugMsg += err.response.status
            if (err.response.status === 200) {
              // https://dev.paghiper.com/reference#mensagens-de-retorno-2
              const { data } = err.response
              if (data) {
                debugMsg += ' ' + (typeof data === 'object' ? JSON.stringify(data) : data)
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
