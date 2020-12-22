'use strict'

const endpointNotification = require(process.cwd() + '/routes/paghiper/notification')

module.exports = appSdk => {
  const handler = endpointNotification(appSdk)
  return (req, res) => {
    req.isPix = true
    handler(req, res)
  }
}
