import { DefaultSerializer, Logger, LogLevel, RFC3339Stamper, Serializer, Stamper, StandardLogger, Writer } from "."

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
const FooStamper: Stamper = () => ({ foo: "bar" })
const FazStamper: Stamper = () => ({ faz: "baz" })

describe("DefaultSerializer", () => {

    describe(`when serializing an error`, () => {

        const error = new Error("example")
        const got = DefaultSerializer({error})

        test("should stringify the error", () => {
            expect( got ).toEqual( `{"error":"Error: example"}` )
        })

    })

    // more info
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
    describe(`when serializing recursive objects`, () => {

        let circularReference:any = { otherData: 123 }
        circularReference.myself = circularReference
        circularReference.nested = { circularReference }
        const got = DefaultSerializer( circularReference )

        test(`should only serialize an object once`, async () => {
            expect( got ).toEqual( `{"otherData":123,"nested":{}}` )
        })

    })

})

describe("RFC3339Stamper", () => {

    // borrowed from: https://regex101.com/library/qH0sU7
    const RFCRegex = /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[+-]\d{2}:\d{2})?)$/

    test("should return a timestamp with valid RFC3339 time as string", () => {
        expect( RFC3339Stamper() ).toHaveProperty( "timestamp", expect.stringMatching( RFCRegex ) )
    })

})

describe("Logger", () => {

    test(`should log all levels with level set in output`, async () => {

        // setup
        const writer = new FakeWriter()
        const logger = new Logger( LogLevel.DEBUG, writer.write, NoSerializer, [] )

        // run
        logger.debug( "foo" )
        expect( writer.message ).toEqual( {"message":"foo","level":"DEBUG"} )
        logger.info( "foo" )
        expect( writer.message ).toEqual( {"message":"foo","level":"INFO"} )
        logger.warn( "foo" )
        expect( writer.message ).toEqual( {"message":"foo","level":"WARN"} )
        logger.error( "foo" )
        expect( writer.message ).toEqual( {"message":"foo","level":"ERROR"} )

    })

    describe(`when setting log level to DEBUG`, () => {

        const writer = new FakeWriter()
        const logger = new Logger( LogLevel.DEBUG, writer.write, NoSerializer, [] )

        test(`should log debug logs`, async () => {
            logger.debug( "foo" )
            expect( writer.message ).toEqual( {"message":"foo","level":"DEBUG"} )
        })
    })

    describe(`when setting log level to INFO`, () => {

        const writer = new FakeWriter()
        const logger = new Logger( LogLevel.INFO, writer.write, NoSerializer, [] )

        test(`should not log debug logs`, async () => {
            logger.debug( "foo" )
            expect( writer.message ).toBeUndefined()
        })
    })

    describe(`when adding context to a logger`, () => {

        const writer = new FakeWriter()
        const logger = new Logger( LogLevel.INFO, writer.write, NoSerializer, [] )
        const foologger = logger.with({ foo: "bar" })

        test(`should keep any context from earlier`, () => {
            foologger.info( "example", { faz: "baz" } )
            expect( writer.message ).toEqual( {"message":"example","level":"INFO","foo":"bar","faz":"baz"} )
        })

        test(`should not impact parent logger`, () => {
            logger.info( "example" )
            expect( writer.message ).toEqual( {"message":"example","level":"INFO"} )
        })

    })

    describe(`when given a "foo" stamper`, () => {

        const writer = new FakeWriter()
        const logger = new Logger( LogLevel.INFO, writer.write, NoSerializer, [FooStamper] )
        
        test(`should stamp every message with foo`, () => {
            logger.info("hi")
            expect( writer.message ).toEqual( {"message":"hi","level":"INFO","foo":"bar"} )
        })

    })

    describe(`when given a "foo" and "faz" stamper`, () => {

        const writer = new FakeWriter()
        const logger = new Logger( LogLevel.INFO, writer.write, NoSerializer, [FooStamper, FazStamper] )
        
        test(`should stamp every message with foo and faz`, () => {
            logger.info("hi")
            expect( writer.message ).toEqual( {"message":"hi","level":"INFO","foo":"bar","faz":"baz"} )
        })

    })

})

describe(`StandardLogger`, () => {

    test(`should be defined`, () => {
        expect( StandardLogger ).toBeDefined()
        StandardLogger.info("example") // can't really assert anything here, just nice for humans to see
    })

})
