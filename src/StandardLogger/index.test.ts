import { StandardLogger } from '..'

test(`StandardLogger should be defined`, () => {
    expect(StandardLogger).toBeDefined()
    StandardLogger.info('example') // can't really assert anything here, just nice for humans to see
})
