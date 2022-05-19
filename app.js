const express = require('express')
const makeRequest = require('./utilities').makeRequest

const app = express()

app.listen(3000)

app.get('/country', async (req, res) => {
  try {
    const result = await makeRequest('GET', '/v1/payment_methods/country?country=mx')

    res.json(result)
  } catch (error) {
    console.error('Error completing request', error)
  }
})

