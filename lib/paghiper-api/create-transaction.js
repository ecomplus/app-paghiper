'use strict'

// Axios HTTP client
const axios = require('axios')

const PAGHIPER_API = 'https://api.paghiper.com'

module.exports = (apiKey, transactionBody) => {
  // create new transaction to PagHiper API
  // https://dev.paghiper.com/reference#gerar-boleto
  const data = transactionBody
  if (process.env.PAGHIPER_PARTNER_ID) {
    data.partners_id = process.env.PAGHIPER_PARTNER_ID
  }

  // returns request promise
  return axios.post(`${PAGHIPER_API}/transaction/create/`, data, {
    // axios request options
    // https://github.com/axios/axios#request-config
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json',
      'Accept-Charset': 'UTF-8',
      'Accept-Encoding': 'application/json'
    },
    // wait up to 30s
    timeout: 30000,
    validateStatus (status) {
      // success only when received 201
      return status === 201
    }
  })
}
