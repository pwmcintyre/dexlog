import { RFC3339Stamper } from '.'

// borrowed from: https://regex101.com/library/qH0sU7
const RFCRegex = /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[+-]\d{2}:\d{2})?)$/

test('should return a timestamp with valid RFC3339 time as string', () => {
    const output = RFC3339Stamper()
    expect(output).toHaveProperty('timestamp', expect.stringMatching(RFCRegex))
})
