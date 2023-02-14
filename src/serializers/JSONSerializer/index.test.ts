import { JSONSerializer } from '.'

describe(`when serializing errors`, () => {
    test('should stringify the error', () => {
        const got = JSONSerializer({ error: new Error('example') })
        expect(got).toEqual(`{"error":"Error: example"}`)
    })
})

describe(`when serializing buffers`, () => {
    test('should stringify the buffer', () => {
        const got = JSONSerializer({ word: Buffer.from('example') })
        expect(got).toEqual(`{"word":"example"}`)
    })
})

describe(`when serializing undefined objects`, () => {
    test('should not attempt to serialize', () => {
        const got = JSONSerializer(undefined)
        expect(got).toEqual(undefined)
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
        expect(got).toEqual(`{"otherData":123,"nested":{}}`)
    })
})
