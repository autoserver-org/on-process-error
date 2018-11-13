'use strict'

const { src, series, parallel } = require('gulp')
const jscpd = require('gulp-jscpd')

const FILES = require('../files')
const { getWatchTask } = require('../utils')
const gulpExeca = require('../exec')

const format = function() {
  const files = [...FILES.JAVASCRIPT].join(' ')
  return gulpExeca(`prettier --write --loglevel warn ${files}`)
}

// We do not use `gulp-eslint` because it does not support --cache
const eslint = function() {
  const files = [...FILES.JAVASCRIPT, ...FILES.MARKDOWN].join(' ')
  return gulpExeca(
    `eslint ${files} --ignore-path .gitignore --fix --cache --format codeframe --max-warnings 0 --report-unused-disable-directives`,
  )
}

const lint = series(format, eslint)

// eslint-disable-next-line fp/no-mutation
lint.description = 'Lint source files'

const dup = function() {
  return src([...FILES.JAVASCRIPT, ...FILES.MARKDOWN]).pipe(
    jscpd({
      verbose: true,
      blame: true,
      'min-lines': 0,
      'min-tokens': 30,
      'skip-comments': true,
    }),
  )
}

// eslint-disable-next-line fp/no-mutation
dup.description = 'Check for code duplication'

const check = parallel(lint, dup)

// eslint-disable-next-line fp/no-mutation
check.description = 'Lint and check for code duplication'

const checkwatch = getWatchTask(
  { JAVASCRIPT: [lint, dup], MARKDOWN: [lint, dup] },
  check,
)

// eslint-disable-next-line fp/no-mutation
checkwatch.description = 'Lint and test the application in watch mode'

module.exports = {
  check,
  checkwatch,
  lint,
  dup,
}
