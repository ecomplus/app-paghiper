'use strict'

// read configured E-Com Plus app data
const getConfig = require(process.cwd() + '/lib/store-api/get-config')

module.exports = (appSdk, storeId) => {
  return (req, res) => {
    // get app configured options
    // including hidden (authenticated) data
    getConfig({ appSdk, storeId }, true)

      .then(configObj => {
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
