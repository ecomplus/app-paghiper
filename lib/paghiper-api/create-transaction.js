'use strict'

// axios instance with presets for PagHiper API
const client = require('./client')

module.exports = (apiKey, transactionBody) => {
  // create new transaction to PagHiper API
  // https://dev.paghiper.com/reference#gerar-boleto
  const data = transactionBody
  if (process.env.PAGHIPER_PARTNER_ID) {
    data.partners_id = process.env.PAGHIPER_PARTNER_ID
  }

  // returns request promise
  return client.post('/transaction/create/', data, {
    validateStatus (status) {
      // success only when received 201
      return status === 201
    }
  })
}
