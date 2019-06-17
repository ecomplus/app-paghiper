'use strict'

// SQLite3 database abstracted
const { save } = require('./../database')
// axios instance with presets for PagHiper API
const client = require('./client')

module.exports = (transactionBody, storeId, orderId) => {
  // create new transaction to PagHiper API
  // https://dev.paghiper.com/reference#gerar-boleto
  const data = transactionBody
  if (process.env.PAGHIPER_PARTNER_ID) {
    data.partners_id = process.env.PAGHIPER_PARTNER_ID
  }

  // returns request promise
  return client.post('/transaction/create/', data).then(res => {
    const { data } = res
    // save transaction ID on database first
    const transactionCode = data.create_request.transaction_id
    return save(transactionCode, storeId, orderId).then(() => data)
  })
}
