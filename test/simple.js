'use strict'

const test = require('ava')
const execa = require('execa')

const { repeatEvents, normalizeMessage } = require('./helpers')

repeatEvents((prefix, { eventName }) => {
  test(`${prefix} should work using the -r flag`, async t => {
    const returnValue = await callLoader({ eventName, loader: 'simple' })

    t.snapshot(returnValue)
  })

  test(`${prefix} should work with --no-warnings`, async t => {
    const returnValue = await callLoader({
      eventName,
      loader: 'simple',
      flags: '--no-warnings',
    })

    t.snapshot(returnValue)
  })

  test(`${prefix} should work using both the -r flag and init()`, async t => {
    const returnValue = await callLoader({
      eventName,
      loader: 'noop',
      flags: '--no-warnings',
    })

    t.snapshot(returnValue)
  })
})

const callLoader = async function({ eventName, loader, flags = '' }) {
  const { stdout, stderr, code } = await execa.shell(
    `node ${flags} ${LOADERS[loader]} ${eventName}`,
    { reject: false },
  )

  const message = normalizeMessage(stderr)
  const stdoutA = normalizeMessage(stdout)

  return { code, message, stdout: stdoutA }
}

const LOADERS = {
  simple: `${__dirname}/helpers/simple_loader`,
  noop: `${__dirname}/helpers/noop_loader`,
}
