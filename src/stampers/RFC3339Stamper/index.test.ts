import assert from 'node:assert'
import { describe, test } from 'node:test'
import { RFC3339Stamper } from '.'

// borrowed from: https://regex101.com/library/qH0sU7
const RFCRegex = /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[+-]\d{2}:\d{2})?)$/

describe(`RFC3339Stamper`, () => {
    const output = RFC3339Stamper()
    test('should return a timestamp', () => {
        assert.ok('timestamp' in output)
    })
    test('should be valid RFC3339 time as string', () => {
        assert.match(output.timestamp, RFCRegex)
    })
})
