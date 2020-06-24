# Logger

This is a low-frills, zero-dependency logger, with a focus on good developer experience.

By default it serializes to JSON and writes to stdout with RFC3339 timestamp, but you can bring your own serializer / writer.

## Install

```shell
npm i --save dexlog
```

## Import

```TypeScript
import { StandardLogger } from "dexlog"
```

## Usage

### Basic

```TypeScript
StandardLogger.info( "this is information" )
// > {"message":"this is information","level":"INFO","timestamp":"2020-06-23T06:46:11.799Z"}
```

### With context

```TypeScript
StandardLogger.error( "failed to do the thing", { error } )
// > {"message":"failed to do the thing","level":"ERROR","error":"Error: foo","timestamp":"2020-06-23T06:46:11.799Z"}
```

OR

```TypeScript
StandardLogger.with({ error }).error( "failed to do the thing" )
// > {"message":"failed to do the thing","level":"ERROR","error":"Error: foo","timestamp":"2020-06-23T06:46:11.799Z"}
```

### Keeping context

You can keep context for re-use

```TypeScript
const user_id = "dave"

// you can create context loggers
const contextlogger = StandardLogger.with({ user_id })

// then use as per normal
contextlogger.info( "did a thing" )
// > {"message":"did a thing","level":"INFO","user_id":"dave"}
```

### Custom Log Level

RECOMMENDED:  
The `StandardLogger` uses the environment level "LOG_LEVEL" - set it as needed:

```shell
$ LOG_LEVEL=INFO node .
```

OR:  
you can set it programmatically:

```TypeScript
import { LogLevel, Logger, Writer } from "./logger"
const logger = new Logger( LogLevel.DEBUG )
```

## Practical use-case

Lets say you are using lambda, you might want to add context to your logger like this:

```TypeScript
export async function lambda_handler( event: any, context: LambdaContext ): Promise<any> {

    const logger = StandardLogger.with({ request_id: context.awsRequestId })

    logger.debug( "event recieved", { event })

}
```

## Advanced uses

Most of the time you'll want to use the StandardLogger, but just in case you need some customization

### Customer Writer

You can bring a writer, it just has to be a function which takes an object and returns nothing.

Interface:
```TypeScript
export type Writer = (msg: any) => void
```

Example implementation which writes to S3:
```TypeScript
// S3Writer writes to S3
class S3Writer {
    constructor(
        public Bucket: string,
        public Key: string,
        public s3: AWS.S3 = new AWS.S3(),
    ) {}
    public write: Writer = (Body: any) => {
        s3.putObject({ Body, Bucket: this.Bucket, Key: this.Key }) // this is an async function, don't actually do this
    }
}
const writer = new S3Writer("examplebucket", "examplekey")
const logger = new Logger( LogLevel.INFO, writer.write )
```

### Custom Serializer

A Serializer takes anything and returns a string.

Interface:
```TypeScript
export type Serializer = (msg: any) => string
```

Example implementation which returns everything in CAPS!
```TypeScript
const AngrySerializer: Serializer = (msg: any) => JSON.stringify(msg).toUpperCase()
const logger = new Logger( LogLevel.DEBUG, StdOutWriter, AngrySerializer )
logger.error("what?!") // {"MESSAGE":"WHAT?!","LEVEL":"ERROR","TIMESTAMP":"2020-06-23T10:02:03.765Z"}
```

### Custom Stampers

A Stamper returns an object which is appended to your log.

Interface:

```TypeScript
export type Stamper = () => any
```

Example implementation which stamps messages with "foo" and a backwards timestamp:

```TypeScript
// timestamper
const locale = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/New_York' })
const FreedomStamper: Stamper = () => ({ time: locale.format(new Date()) })

// foo stamper
const FooStamper: Stamper = () => ({ foo: "bar" })

// logger
const logger = new Logger( LogLevel.DEBUG, StdOutWriter, DefaultSerializer, [FreedomStamper,FooStamper] )

// usage
logger.info("Hello, sir") // {"message":"Hello, World!","level":"INFO","time":"6/23/2020","foo":"bar"}
```
