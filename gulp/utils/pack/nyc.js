'use strict'

const { readFile, writeFile } = require('fs')
const { normalize } = require('path')
const { promisify } = require('util')

const execa = require('execa')

const { replaceAll, fileExists } = require('./utils')
const { ENV_VAR } = require('./constants')

const pReadFile = promisify(readFile)
const pWriteFile = promisify(writeFile)

// When using `pack`, tested files will be inside `buildDir`
// This won't work properly with nyc unless using `--cwd` flag.
// Otherwise those files will be ignored, and flags like `--all` won't work.
// We need to also specify `--report|temp|cache-dir` to make sure those
// directories do not use `buildDir`.
const isNyc = function({ command }) {
  const [mainCommand, subCommand] = command.trim().split(/\s+/u)
  return mainCommand === 'nyc' && !NYC_SUB_COMMANDS.includes(subCommand)
}

// We only patch top-level `nyc` not `nyc instrument`, etc.
const NYC_SUB_COMMANDS = ['check-coverage', 'report', 'instrument', 'merge']

const fireNyc = async function({ command, packageRoot, buildDir }) {
  const commandA = fixCommand({ command, packageRoot, buildDir })

  await execa.shell(commandA, {
    stdio: 'inherit',
    env: { [ENV_VAR]: buildDir },
  })

  await fixCovMap({ packageRoot, buildDir })
}

const fixCommand = function({ command, packageRoot, buildDir }) {
  return command.replace(
    'nyc',
    `nyc --clean --cwd ${buildDir} --report-dir ${packageRoot}/coverage --temp-dir ${packageRoot}/.nyc_output --cache-dir ${packageRoot}/node_modules/.cache/nyc`,
  )
}

// We need to strip `buildDir` from file paths in coverage maps, because
// tools (like `nyc` reporters and `coveralls`) require them to point to
// source files that exist on the filesystem.
const fixCovMap = async function({ packageRoot, buildDir }) {
  // Retrieve coverage map location and make sure it exists.
  const covMapPath = `${packageRoot}/coverage/lcov.info`

  const covMapExists = await fileExists({ path: covMapPath, readWrite: true })

  if (!covMapExists) {
    return
  }

  await substituteCovMap({ packageRoot, buildDir, covMapPath })
}

const substituteCovMap = async function({ packageRoot, buildDir, covMapPath }) {
  // For Windows
  const buildDirA = normalize(buildDir)

  const covMap = await pReadFile(covMapPath, { encoding: 'utf-8' })
  const covMapA = replaceAll(covMap, buildDirA, packageRoot)
  await pWriteFile(covMapPath, covMapA, { encoding: 'utf-8' })
}

module.exports = {
  isNyc,
  fireNyc,
}