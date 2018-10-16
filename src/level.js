'use strict'

const { platform } = require('process')

const { red, yellow } = require('chalk')

const getLevel = function({ opts, info }) {
  const level = opts.getLevel(info)
  const levelInfo = LEVELS[level]

  if (levelInfo === undefined) {
    const levels = Object.keys(LEVELS).join(', ')
    // TODO: infinite recursion?
    throw new Error(`Level ${level} is invalid. Must be one of: ${levels}`)
  }

  return { level, levelInfo }
}

const isWindows = platform === 'win32'
// Each level is printed in a different way
const LEVELS = {
  warn: {
    COLOR: yellow,
    SIGN: isWindows ? '\u203C' : '\u26A0',
  },
  error: {
    COLOR: red,
    SIGN: isWindows ? '\u00D7' : '\u2718',
  },
}

const defaultGetLevel = function({ eventName }) {
  if (eventName === 'warning') {
    return 'warn'
  }

  return 'error'
}

module.exports = {
  getLevel,
  defaultGetLevel,
}
