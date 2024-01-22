import assert from 'node:assert'
import { describe, test } from 'node:test'
import {
    JSONSerializer,
    Logger,
    LogLevel,
    RFC3339Stamper,
    Serializer,
    Stamper,
    StdOutWriter,
    Writer,
} from '..'

// helps us inspect the output of Logger without emitting to default std out
class FakeWriter {
    public message: any = undefined
    public write: Writer = (msg: any) => {
        this.message = msg
    }
}

// helps us inspect output of logger withouth converting it to string first
const NoSerializer: Serializer = (msg: any) => msg

// example Stamper which add just adds some "foo"
const FooStamper: Stamper = () => ({ foo: 'bar' })
const FazStamper: Stamper = () => ({ faz: 'baz' })

describe(`defaults`, () => {
    const l = new Logger({})
    test(`should default to INFO level`, () => {
        assert.strictEqual(l.options.level, LogLevel.INFO)
    })
    test(`should default to JSONSerializer`, () => {
        assert.strictEqual(l.options.serialize, JSONSerializer)
    })
    test(`should default to RFC3339Stamper`, () => {
        assert.strictEqual(l.options.stamps.length, 1)
        assert.strictEqual(l.options.stamps[0], RFC3339Stamper)
    })
    test(`should default to StdOutWriter`, () => {
        assert.strictEqual(l.options.write, StdOutWriter)
    })
})

describe(`when emitting logs of each level`, () => {
    test(`should include level in output`, () => {
        // setup
        const writer = new FakeWriter()
        const logger = new Logger({
            level: LogLevel.DEBUG,
            serialize: NoSerializer,
            write: writer.write,
            stamps: [],
        })

        // run
        logger.debug('foo')
        assert.deepEqual(writer.message, { message: 'foo', level: 'DEBUG' })
        logger.info('foo')
        assert.deepEqual(writer.message, { message: 'foo', level: 'INFO' })
        logger.warn('foo')
        assert.deepEqual(writer.message, { message: 'foo', level: 'WARN' })
        logger.error('foo')
        assert.deepEqual(writer.message, { message: 'foo', level: 'ERROR' })
    })
})

describe(`when setting log level to DEBUG`, () => {
    const writer = new FakeWriter()
    const logger = new Logger({
        level: LogLevel.DEBUG,
        serialize: NoSerializer,
        write: writer.write,
        stamps: [],
    })

    test(`should log debug logs`, () => {
        logger.debug('foo')
        assert.deepEqual(writer.message, { message: 'foo', level: 'DEBUG' })
    })
})

describe(`when setting log level to INFO`, () => {
    const writer = new FakeWriter()
    const logger = new Logger({
        level: LogLevel.INFO,
        serialize: NoSerializer,
        write: writer.write,
        stamps: [],
    })

    test(`should not log debug logs`, () => {
        logger.debug('foo')
        assert.deepEqual(writer.message, undefined)
    })
})

describe(`when adding context to a logger`, () => {
    const writer = new FakeWriter()
    const logger = new Logger({
        level: LogLevel.DEBUG,
        serialize: NoSerializer,
        write: writer.write,
        stamps: [],
    })
    const foologger = logger.with({ foo: 'bar' })

    test(`should keep any context from earlier`, () => {
        foologger.info('example', { faz: 'baz' })
        assert.deepEqual(writer.message, {
            message: 'example',
            level: 'INFO',
            foo: 'bar',
            faz: 'baz',
        })
    })

    test(`should not impact parent logger`, () => {
        logger.info('example')
        assert.deepEqual(writer.message, { message: 'example', level: 'INFO' })
    })
})

describe(`when given a "foo" stamper`, () => {
    const writer = new FakeWriter()
    const logger = new Logger({
        level: LogLevel.DEBUG,
        serialize: NoSerializer,
        write: writer.write,
        stamps: [FooStamper],
    })

    test(`should stamp every message with foo`, () => {
        logger.info('hi')
        assert.deepEqual(writer.message, { message: 'hi', level: 'INFO', foo: 'bar' })
    })
})

describe(`when given a "foo" and "faz" stamper`, () => {
    const writer = new FakeWriter()
    const logger = new Logger({
        level: LogLevel.DEBUG,
        serialize: NoSerializer,
        write: writer.write,
        stamps: [FooStamper, FazStamper],
    })

    test(`should stamp every message with foo and faz`, () => {
        logger.info('hi')
        assert.deepEqual(writer.message, { message: 'hi', level: 'INFO', foo: 'bar', faz: 'baz' })
    })
})
