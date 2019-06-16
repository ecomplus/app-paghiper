'use strict'

module.exports = body => {
  // parse create transaction module request body to PagHiper reference
  // https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
  const { buyer, amount, items } = body
  const address = body.billing_address || body.to || {}

  // https://dev.paghiper.com/reference#gerar-boleto
  const paghiperTransaction = {
    order_id: body.order_number || body.order_id || new Date().getTime().toString(),
    payer_email: buyer.email,
    payer_name: buyer.fullname,
    payer_cpf_cnpj: buyer.doc_number,
    payer_phone: buyer.phone.number,
    payer_street: address.street || '',
    payer_number: address.number || '',
    payer_complement: address.complement || '',
    payer_district: address.borough || '',
    payer_city: address.city || '',
    payer_state: address.province_code || '',
    payer_zip_code: address.zip ? address.zip.replace(/\D/g, '') : '',
    notification_url: process.env.APP_BASE_URI + '/paghiper/notification',
    discount_cents: amount.discount ? Math.ceil(amount.discount * 100) : '',
    shipping_price_cents: amount.freight ? Math.ceil(amount.freight * 100) : '',
    fixed_description: true,
    type_bank_slip: 'boletoA4',
    days_due_date: 5,
    late_payment_fine: 2,
    per_day_interest: true,
    items: []
  }

  // parse transaction items list
  items.forEach(item => {
    paghiperTransaction.items.push({
      description: item.name,
      item_id: item.sku,
      quantity: item.quantity,
      price_cents: Math.ceil((item.final_price || item.price) * 100)
    })
  })

  return paghiperTransaction
}
