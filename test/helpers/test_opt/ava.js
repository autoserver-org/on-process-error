// eslint-disable-next-line ava/no-ignored-test-files
'use strict'

const {
  env: { OPTIONS },
} = require('process')

const test = require('ava')

const logProcessErrors = require('../../../src')
const { EVENTS } = require('../emit')
const { stubStackTrace } = require('../stack')

stubStackTrace()

const { name, ...options } = JSON.parse(OPTIONS)

if (options.register) {
  // eslint-disable-next-line import/no-dynamic-require
  require(`${__dirname}/../../../../register/ava`)
} else {
  logProcessErrors(options)
}

test(`should make tests fail on ${name}`, t => {
  // eslint-disable-next-line no-empty-function
  EVENTS[name]().catch(() => {})
  t.pass()
})