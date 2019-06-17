'use strict'

// axios instance with presets for PagHiper API
const client = require('./client')

module.exports = readNotificationBody => {
  // read full notification body from PagHiper API
  // https://dev.paghiper.com/reference#qq
  // returns request promise
  return client.post('/transaction/notification/', readNotificationBody).then(res => res.data)
}
