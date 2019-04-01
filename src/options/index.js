'use strict'

const { validate } = require('jest-validate')

const {
  applyDefaultLevels,
  getExampleLevels,
  validateLevels,
} = require('../level')
const { validateExitOn } = require('../exit')
const { defaultLog } = require('../log')
const { addChalk } = require('../colors')
const { pickBy } = require('../utils')

const { applyTesting, getExampleTesting } = require('./testing')

// Validate options and assign default options
const getOptions = function({ opts = {} }) {
  const optsA = pickBy(opts, value => value !== undefined)

  validate(optsA, { exampleConfig: EXAMPLE_OPTS })
  validateOptions(optsA)

  const optsB = applyTesting({ opts: optsA })
  const level = applyDefaultLevels({ opts: optsB })
  const optsC = { ...DEFAULT_OPTS, ...optsB, level }

  const optsD = addChalk(optsC)
  return optsD
}

const DEFAULT_OPTS = {
  log: defaultLog,
  exitOn: ['uncaughtException'],
  colors: true,
}

// `validate-jest` prints the function body
// eslint-disable-next-line no-empty-function
const exampleFunction = function() {}

const EXAMPLE_OPTS = {
  ...DEFAULT_OPTS,
  log: exampleFunction,
  level: getExampleLevels(),
  testing: getExampleTesting(),
}

// Validation beyond what `jest-validate` can do
const validateOptions = function({ exitOn, level = {} }) {
  validateLevels({ level })
  validateExitOn({ exitOn })
}

module.exports = {
  getOptions,
}
