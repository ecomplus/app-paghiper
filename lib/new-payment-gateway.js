'use strict'

module.exports = lang => {
  // returns default payment gateway object
  const label = lang === 'pt_br' ? 'Boleto bancário' : 'Banking billet'
  return {
    label,
    payment_method: {
      code: 'banking_billet',
      name: `${label} - PagHiper`
    },
    intermediator: {
      name: 'PagHiper',
      link: 'https://www.paghiper.com/',
      code: 'paghiper'
    }
  }
}
