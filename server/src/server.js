const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const app = require('./app')

const serverPort = process.env.PORT || process.env.SERVER_PORT || 8080

const start = async () => {
  if (process.env.NODE_ENV === 'production') {
    http.createServer(app).listen(serverPort, '0.0.0.0', () => {
      console.log(`Listening on http://0.0.0.0:${serverPort}`)
    })
  } else {
    const serverOptions = {
      key: fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../certs/cert.pem')),
    }

    https.createServer(serverOptions, app).listen(serverPort, () => {
      console.log(`Listening on https://localhost:${serverPort}`)
    })
  }
}

exports.app = app
exports.start = start
