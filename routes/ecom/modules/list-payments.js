'use strict'

// read configured E-Com Plus app data
const getConfig = require(process.cwd() + '/lib/store-api/get-config')
// generate default payment gateway object
const newPaymentGateway = require(process.cwd() + '/lib/new-payment-gateway')

module.exports = appSdk => {
  return (req, res) => {
    const { storeId, body } = req
    // get app configured options
    getConfig({ appSdk, storeId })

      .then(config => {
        // treat list payments module request body and mount response
        // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
        // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
        let paymentGateway = newPaymentGateway(body.lang)
        // merge cunfigured options to payment gateway object
        ;[ 'label', 'text', 'icon', 'discount' ].forEach(prop => {
          if (config[prop]) {
            paymentGateway[prop] = config[prop]
          }
        })
        // setup response object
        let response = {
          payment_gateways: [ paymentGateway ]
        }

        if (paymentGateway.discount) {
          // default discount option
          let { type, value } = paymentGateway
          let label = config.discount_option_label || paymentGateway.label
          response.discount_option = { label, value }
          // specify the discount type is optional
          if (type) {
            response.discount_option.type = type
          }
        }

        res.send(response)
      })

      .catch(err => {
        // request to Store API with error response
        // return error status code
        res.status(500)
        let { message } = err
        res.send({
          error: 'LIST_PAYMENTS_ERR',
          message
        })
      })
  }
}
