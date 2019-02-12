'use strict'

// Normalize console messages for testing
const normalizeMessage = function(message) {
  return message
    .replace(FIRST_SIGN_REGEXP, '[]')
    .replace(WARNING_PID_REGEXP, '(node:PID)')
    .replace(WARNING_OLD_REGEXP, '$1$2')
}

// The first sign in a console message is OS-dependent, so we remove it
const FIRST_SIGN_REGEXP = /^ [^ ]+/gmu
// Default Node.js warnings show PID, which we remove
const WARNING_PID_REGEXP = /\(node:\d+\)/u
// Default Node.js warnings <8 look different (no `code`, no `detail`)
// TODO: remove when Node.js <8 is not supported anymore
const WARNING_OLD_REGEXP = /(\(node:PID\)) \[[^\]]+\](.*)\n.*/u

module.exports = {
  normalizeMessage,
}
