'use strict'

// read configured E-Com Plus app data
const getConfig = require(process.cwd() + '/lib/store-api/get-config')
// parse craete transaction body from Mods API to PagHiper model
const parseTransactionBody = require(process.cwd() + '/lib/parse-transaction-body')
// create new transaction to PagHiper API
const createTransaction = require(process.cwd() + '/lib/paghiper-api/create-transaction')

module.exports = appSdk => {
  return (req, res) => {
    const { storeId, body } = req
    // treat create transaction module request body
    // https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
    const orderId = body.order_id

    // get app configured options
    // including hidden (authenticated) data
    getConfig({ appSdk, storeId }, true)

      .then(config => {
        // setup transaction body to PagHiper reference
        // https://dev.paghiper.com/reference#gerar-boleto
        const paghiperTransaction = parseTransactionBody(body)
        const options = config.banking_billet_options
        if (typeof options === 'object' && options !== null) {
          // merge configured options
          // options must have only valid properties for PagHiper transaction object
          for (let prop in options) {
            if (options.hasOwnProperty(prop) && options[prop] !== null) {
              paghiperTransaction[prop] = options[prop]
            }
          }
        }
        // send request to PagHiper API
        return createTransaction(paghiperTransaction, storeId, orderId)
      })

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
            : body.amount.total
        }
        if (createRequest.due_date) {
          transaction.banking_billet.valid_thru = new Date(createRequest.due_date).toISOString()
        }

        // all done
        // send response and finish process
        res.send({ transaction })
      })

      .catch(err => {
        // return error status code
        res.status(500)
        let { message } = err
        res.send({
          error: 'CREATE_TRANSACTION_ERR',
          message
        })
      })
  }
}
