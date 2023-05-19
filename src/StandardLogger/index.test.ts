import assert from 'node:assert'
import { describe, test } from 'node:test'
import { StandardLogger } from '..'

describe('StandardLogger', () => {
    test(`should be defined`, () => {
        assert.ok(StandardLogger)
    })
})
