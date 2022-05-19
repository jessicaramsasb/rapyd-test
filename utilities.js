const https = require('https')
const crypto = require('crypto')
const accessKey = ''
const secretKey = ''
const log = false

async function makeRequest(method, urlPath, body = null) {
  try {
    const httpMethod = method
    const httpBaseURL = 'sandboxapi.rapyd.net'
    const httpURLPath = urlPath
    const salt = generateRandomString(12)
    const idempotency = new Date().getTime().toString()
    const timestamp =  (Math.floor(new Date().getTime() / 1000) - 10).toString()
    const signature = sign(httpMethod, urlPath, salt, timestamp, body)

    const options = {
      hostname: httpBaseURL,
      port: 443,
      path: httpURLPath,
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        salt: salt,
        timestamp: timestamp,
        signature: signature,
        idempotency: idempotency,
        access_key: accessKey,
        idempotency: idempotency
      }
    }

    return await httpRequest(options, body)
  } catch(err) {
    console.error('makeRequest', err)
  }
}

function sign(httpMethod, urlPath, salt, timestamp, body) {
  try {
    let bodyString = ""
    if (body) {
      bodyString = JSON.stringify(body)
      bodyString = bodyString == "{}" ? "" : bodyString
    }

    let toSign = httpMethod.toLowerCase() + urlPath + salt + timestamp + accessKey + secretKey + bodyString
    log && console.log(`toSign: ${toSign}`)

    let hash = crypto.createHmac('sha256', secretKey);
    hash.update(toSign)
    const signature = Buffer.from(hash.digest("hex")).toString("base64")
    log && console.log(`signature: ${signature}`)

    return signature
  } catch (error) {
    console.error("Error generating signature")
    throw error
  }
}

function generateRandomString(size) {
  try {
    return crypto.randomBytes(size).toString('hex')
  }
  catch (error) {
    console.error('salt', error)
  }
}

async function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    try {
      let bodyString = ""
      if (body) {
        bodyString = JSON.stringify(body)
        bodyString = bodyString == "{}" ? "" : bodyString
      }

      log && console.log(`httpRequest options: ${JSON.stringify(options)}`)
      const req = https.request(options, (res) => {
        let response = {
          statusCode: res.statusCode,
          headers: res.headers,
          body: ''
        }

        res.on('data', (data) => {
          response.body += data
        })

        res.on('end', () => {
          response.body = response.body ? JSON.parse(response.body) : {}
          log && console.log(`httpRequest response: ${JSON.stringify(response)}`)
          if (response.statusCode !== 200) {
            return reject(response)
          }
          return resolve(response)
        })
      })

      req.on('error', (error) => {
        return reject(error)
      })

      req.write(bodyString)
      req.end()
    } catch(err) {
      return reject('httpRequest', err)
    }
  })
}

exports.makeRequest = makeRequest
