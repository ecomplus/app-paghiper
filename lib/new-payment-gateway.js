'use strict'

module.exports = lang => {
  // returns default payment gateway object
  return {
    label: lang === 'pt_br' ? 'Boleto bancário' : 'Banking billet',
    payment_method: 'banking_billet',
    intermediator: {
      name: 'PagHiper',
      link: 'https://www.paghiper.com/',
      code: 'paghiper'
    }
  }
}
