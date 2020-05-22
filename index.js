// usage: `cat output.txt | node ./index.js`

const split = require('split')
const printf = require('printf')

const passingMark = '[32m✓'
const failingMark = '[31m×'

const UUID_RE = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi

const results = []

function onend() {
  let pass = 0
  let fail = 0

  function incrementStatus(line) {
    if (line.startsWith(failingMark)) {
      fail += 1
      return true
    }
    if (line.startsWith(passingMark)) {
      pass += 1
    }
    return false
  }

  function normalizeString(string) {
    return string
      .replace(/\t/g, ' ')
      .replace('[32m✓', '✓')
      .replace('[31m×', '×')
      .replace(UUID_RE, '{uuid}')
      .trim()
  }

  do {
    const line = results.shift()
    const failing = incrementStatus(line)
    if (failing) {
      const next = results.shift()
      printf(process.stdout, '%s\t%s\n',
             normalizeString(line),
             normalizeString(next))
    }
  } while (results.length > 0)

  printf(process.stdout, 'pass: %5d fail: %5d\n', pass, fail)
}

process.stdin
  .pipe(split())
  .on('data', d => results.push(d))
  .on('end', onend)
