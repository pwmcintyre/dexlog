import { JSONSerializer } from '.'

describe(`when serializing an error`, () => {
    const error = new Error('example')
    const got = JSONSerializer({ error })

    test('should stringify the error', () => {
        expect(got).toEqual(`{"error":"Error: example"}`)
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
