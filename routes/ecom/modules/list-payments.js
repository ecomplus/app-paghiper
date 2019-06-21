'use strict'

// generate default payment gateway object
const newPaymentGateway = require(process.cwd() + '/lib/new-payment-gateway')

module.exports = appSdk => {
  return (req, res) => {
    const { body } = req
    if (!body) {
      return res.sendStatus(400)
    }

    // treat module request body
    const { params, application } = body
    if (!params || !application) {
      return res.sendStatus(400)
    }
    // app configured options
    const config = Object.assign({}, application.data, application.hidden_data)
    if (!config.paghiper_api_key) {
      // must have configured PagHiper API key and token
      return res.status(406).send({
        error: 'LIST_PAYMENTS_ERR',
        message: 'PagHiper API key is unset on app hidden data (merchant must configure the app)'
      })
    }

    // params object follows list payments request schema:
    // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
    if (!params.lang) {
      // set PT-BR as default
      params.lang = 'pt_br'
    }

    // start mounting response body
    // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
    let paymentGateway = newPaymentGateway(params.lang)
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
  }
}
