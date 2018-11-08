'use strict'

const test = require('ava')

const {
  repeatEventsLevels,
  startLogging,
  stubStackTrace,
  unstubStackTrace,
} = require('./helpers')

/* eslint-disable max-nested-callbacks */
repeatEventsLevels((prefix, { eventName, emitEvent }, level) => {
  test(`${prefix} should fire opts.getMessage() with a default prettifier`, async t => {
    stubStackTrace()

    const { stopLogging, log } = startLogging({
      log: 'spy',
      level,
      colors: false,
      eventName,
    })

    await emitEvent()

    t.true(log.calledOnce)

    // The first sign is OS-dependent, so we remove it
    const message = log.lastCall.args[0].replace(/[^ ]/u, '[]')
    t.snapshot(message)

    stopLogging()

    unstubStackTrace()
  })
})
/* eslint-enable max-nested-callbacks */
