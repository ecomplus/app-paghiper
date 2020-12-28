'use strict'

// SQLite3 database abstracted
const { save } = require('./../database')
// axios instance with presets for PagHiper API
const client = require('./client')

module.exports = (transactionBody, storeId, orderId, isPix) => {
  // create new transaction to PagHiper API
  // https://dev.paghiper.com/reference#gerar-boleto
  const data = transactionBody
  if (process.env.PAGHIPER_PARTNER_ID) {
    data.partners_id = !isPix
      ? process.env.PAGHIPER_PARTNER_ID
      : process.env.PAGHIPER_PIX_PARTNER_ID
  }

  // returns request promise
  const baseURL = isPix ? 'https://pix.paghiper.com/' : undefined
  const endpoint = `/${(isPix ? 'invoice' : 'transaction')}/create/`
  return client.post(endpoint, data, { baseURL }).then(res => {
    const { data } = res
    // save transaction ID on database first
    let createRequest
    if (isPix) {
      createRequest = data.pix_create_request
    }
    if (!createRequest) {
      createRequest = data.create_request
    }
    const transactionCode = createRequest.transaction_id
    return save(transactionCode, storeId, orderId).then(() => createRequest)
  })
}
