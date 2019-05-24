import { inspect } from 'util'

import sinon from 'sinon'
import test from 'ava'
import testEach from 'test-each'

import { EVENT_DATA } from './helpers/repeat.js'
import { LEVELS } from './helpers/level.js'
import { startLogging } from './helpers/init.js'
import { stubStackTrace, unstubStackTrace } from './helpers/stack.js'
import { normalizeMessage } from './helpers/normalize.js'
import { removeProcessListeners } from './helpers/remove.js'

removeProcessListeners()

const snapshotArgs = function([error, level]) {
  return [
    normalizeMessage(inspect(error), { colors: false }),
    String(error.stack),
    String(error),
    level,
  ]
}

testEach(EVENT_DATA, ({ name }, { eventName, emitEvent }) => {
  test.serial(`should fire opts.log() | ${name}`, async t => {
    const { stopLogging, log } = startLogging({ log: 'spy' })

    t.true(log.notCalled)

    await emitEvent()

    t.true(log.called)

    stopLogging()
  })

  test.serial(`should fire opts.log() once | ${name}`, async t => {
    const { stopLogging, log } = startLogging({ log: 'spy', eventName })

    t.true(log.notCalled)

    await emitEvent()

    t.is(log.callCount, 1)

    stopLogging()
  })

  test.serial(`should fire opts.log() with arguments | ${name}`, async t => {
    stubStackTrace()

    const { stopLogging, log } = startLogging({ log: 'spy', eventName })

    await emitEvent({ all: true })

    t.true(log.called)

    const snapshot = log.args.flatMap(snapshotArgs)
    t.snapshot(snapshot)

    stopLogging()

    unstubStackTrace()
  })
})

testEach(
  EVENT_DATA,
  LEVELS,
  ({ name }, { eventName, emitEvent }, level) => {
    test.serial(`should log on the console by default | ${name}`, async t => {
      // eslint-disable-next-line no-restricted-globals
      const stub = sinon.stub(console, level)

      const { stopLogging } = startLogging({
        log: 'default',
        level: { default: level },
        eventName,
      })

      await emitEvent()

      t.is(stub.callCount, 1)

      stopLogging()

      stub.restore()
    })
  },
)
