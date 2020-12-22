'use strict'

// generate default payment gateway object
const newPaymentGateway = require(process.cwd() + '/lib/new-payment-gateway')

module.exports = appSdk => {
  return (req, res) => {
    // body was already pre-validated on @/bin/web.js
    // treat module request body
    const { params, application } = req.body
    const amount = params.amount || {}

    // app configured options
    const config = Object.assign({}, application.data, application.hidden_data)
    if (!config.paghiper_api_key) {
      // must have configured PagHiper API key and token
      return res.status(400).send({
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
    ;['label', 'text', 'icon'].forEach(prop => {
      if (config[prop]) {
        paymentGateway[prop] = config[prop]
      }
    })
    if (config.discount && (!amount.discount || config.cumulative_discount !== false)) {
      paymentGateway.discount = config.discount
    }
    // setup response object
    let response = {
      payment_gateways: [ paymentGateway ]
    }

    // https://dev.paghiper.com/reference#requisi%C3%A7%C3%A3o-para-cria%C3%A7%C3%A3o-de-pix
    if (config.pix && config.pix.enable && (amount.total === undefined || amount.total >= 3)) {
      delete config.pix.enable
      response.payment_gateways.push({
        ...paymentGateway,
        payment_method: {
          code: 'account_deposit',
          name: 'Pix - PagHiper'
        },
        label: 'Pagar com Pix',
        icon: 'https://us-central1-ecom-pix.cloudfunctions.net/app/pix.png',
        ...config.pix
      })
    }

    const { discount } = paymentGateway
    if (discount && discount.value > 0) {
      if (discount.apply_at !== 'freight') {
        // default discount option
        const { value } = discount
        const label = config.discount_option_label || paymentGateway.label
        response.discount_option = { label, value }
        // specify the discount type and min amount is optional
        ;[ 'type', 'min_amount' ].forEach(prop => {
          if (discount[prop]) {
            response.discount_option[prop] = discount[prop]
          }
        })
      }

      if (discount.hasOwnProperty('min_amount')) {
        // check amount value to apply discount
        if (amount.total < discount.min_amount) {
          delete paymentGateway.discount
        } else {
          delete discount.min_amount
        }
      }
    }

    res.send(response)
  }
}
