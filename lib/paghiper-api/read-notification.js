'use strict'

// axios instance with presets for PagHiper API
const client = require('./client')

module.exports = (readNotificationBody, isPix) => {
  // read full notification body from PagHiper API
  // https://dev.paghiper.com/reference#qq
  // returns request promise
  const baseURL = isPix ? 'https://pix.paghiper.com/' : undefined
  const endpoint = `/${(isPix ? 'invoice' : 'transaction')}/notification/`
  return client.post(endpoint, readNotificationBody, { baseURL }).then(res => res.data)
}
