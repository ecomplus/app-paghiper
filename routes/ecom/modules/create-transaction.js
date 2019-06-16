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
    // get app configured options
    // including hidden (authenticated) data
    getConfig({ appSdk, storeId }, true)

      .then(config => {
        // treat create transaction module request body
        // https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
        // setup transaction body to PagHiper reference
        const paghiperTransaction = parseTransactionBody(body)
        // https://dev.paghiper.com/reference#gerar-boleto
        return createTransaction(config.paghiper_api_key, paghiperTransaction)
      })

      .then(() => {
        // transaction created successfully
        // mount response body
        // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
        res.send({})
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
