import assert from 'node:assert'
import { describe, test } from 'node:test'
import { ConsoleSerializer } from '.'
import { LogLevel } from '../../Logger'

describe(`when serializing`, () => {
    const got = ConsoleSerializer({ level: LogLevel[LogLevel.INFO], message: "thing happend", error: new Error('example') })
    test('should stringify the error', () => {
        assert.strictEqual(got, '\x1B[32mINFO\x1B[0m | thing happend\n\t{"error":"Error: example"}')
    })
})
