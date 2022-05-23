const express = require('express')
const makeRequest = require('./utilities').makeRequest

const app = express()

app.listen(3000)

app.get('/country', async (req, res) => {
  try {
    const country = req.query.country ? req.query.country : null
    const result = await makeRequest('GET', `/v1/payment_methods/country?country=${country}`)

    res.json(result)
  } catch (error) {
    console.error('Error completing request', error)
  }
})

app.get('/payment-required-fields', async (req, res) => {
  try {
    const paymentMethod = req.query.country ? req.query.paymentMethod : null

    if (paymentMethod === null) res.status(400).json({ status: 400, message: "Payment method is required" })

    const result = await makeRequest('GET', `/v1/payment_methods/required_fields/${paymentMethod}`)

    res.json(result)
  } catch (error) {
    console.error('Error completing request', error)
  }
})
