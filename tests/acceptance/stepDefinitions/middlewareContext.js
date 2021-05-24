const { After, Before, Given } = require('cucumber')
const fetch = require('node-fetch')
const path = require('path')

const middlewareHost = process.env.MIDDLEWARE_HOST
const middlewareUrl = 'http://' + path.join(middlewareHost, '/')

function handler(statement1, statement2) {
  let statement = ''
  if (statement1) {
    statement = statement + statement1.trim()
  }

  if (statement1 && statement2) {
    statement = statement + ' '
  }

  if (statement2) {
    statement = statement + statement2.trim()
  }

  return fetch(middlewareUrl + 'execute', {
    method: 'POST',
    body: JSON.stringify({ step: 'Given ' + statement }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async res => {
      if (res.ok) {
        return res.text()
      } else {
        const message = await res.text()
        throw new Error(message)
      }
    })
    .catch(err => {
      console.error(err)
      return Promise.reject(err)
    })
}

Before(function() {
  console.log(middlewareUrl + 'init')
  return fetch(middlewareUrl + 'init', {
    method: 'POST'
  })
    .then(res => {
      return res.json()
    })
    .then(res => {
      if (!res.success) {
        throw new Error('Failed to initialize the middleware: ' + res.message)
      }
    })
})

After(function() {
  return fetch(middlewareUrl + 'cleanup', {
    method: 'POST'
  })
})

Given(/^(.*)in the server(.*)$/, handler)
