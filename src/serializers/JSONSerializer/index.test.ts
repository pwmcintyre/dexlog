import assert from 'node:assert'
import { describe, test } from 'node:test'
import { JSONSerializer } from '.'

describe(`when serializing errors`, () => {
    test('should stringify the error', () => {
        const got = JSONSerializer({ error: new Error('example') })
        assert.strictEqual(got, `{"error":"Error: example"}`)
    })
})

describe(`when serializing buffers`, () => {
    test('should stringify the buffer', () => {
        const got = JSONSerializer({ word: Buffer.from('example') })
        assert.strictEqual(got, `{"word":"example"}`)
    })
})

describe(`when serializing undefined or null objects`, () => {
    test('should not attempt to serialize undefined', () => {
        assert.strictEqual(JSONSerializer(undefined), undefined)
    })
    test('should not attempt to serialize null', () => {
        assert.strictEqual(JSONSerializer(null), 'null')
    })
})

// more info
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
describe(`when serializing recursive objects`, () => {
    let circularReference: any = { otherData: 123 }
    circularReference.myself = circularReference
    circularReference.nested = { circularReference }
    const got = JSONSerializer(circularReference)

    test(`should only serialize an object once`, async () => {
        assert.strictEqual(got, `{"otherData":123,"nested":{}}`)
    })
})
