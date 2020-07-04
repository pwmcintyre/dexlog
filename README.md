# dexlog

![Coveralls github](https://img.shields.io/coveralls/github/pwmcintyre/dexlog)
![GitHub](https://img.shields.io/github/license/pwmcintyre/dexlog)

Zero-dependency logging with a focus on developer experience and modern backend runtimes.

## Use-cases

When you're developering for NodeJS (ie. not browsers) on a modern runtime (ie. FaaS / Lambda / containers) and you care about structured logs (ie. as JSON)

## Features

-   Serialized to JSON (by default)
-   Stamped with RFC3339 (by default)
-   Writes to stdout (by default)
-   Easy to emit with context
-   Typescript
-   Extensible

## Install

```shell
npm i --save dexlog
```

## Basic Usage


```js
import { StandardLogger } from 'dexlog'

StandardLogger.info('this is information')
// > {"message":"this is information","level":"INFO","timestamp":"2020-06-23T06:46:11.799Z"}
```

### ... adding context

```js
const id = 'foo'
const error = new Error('not found')
StandardLogger.error('failed to find the thing', { error, id })
// > {"message":"failed to find the thing","level":"ERROR","error":"Error: not found","id":"foo","timestamp":"2020-06-23T06:46:11.799Z"}
```

### ... keeping context

```js
const user_id = 'dave'

// you can create context loggers
const contextLogger = StandardLogger.with({ user_id })

// then use as per normal
contextLogger.info('did a thing')
// > {"message":"did a thing","level":"INFO","user_id":"dave","timestamp":"2020-06-23T06:46:11.799Z"}
```

### Custom Log Level

RECOMMENDED:  
The `StandardLogger` uses the environment level "LOG_LEVEL" - set it as needed:

```shell
$ LOG_LEVEL=INFO node .
```

OR:

you can set it programmatically:

```js
import { LogLevel, Logger } from 'dexlog'
const logger = new Logger(LogLevel.DEBUG)
```

## Practical use-case

Lets say you are using lambda, you might want to add context to your logger like this:

```js
import { StandardLogger } from 'dexlog'
export async function lambda_handler(event: any, context: LambdaContext): Promise<any> {
    const logger = StandardLogger.with({ request_id: context.awsRequestId })

    logger.debug('event recieved', { event })
}
```

## Advanced uses

Most of the time you'll want to use the StandardLogger, but just in case you need some customization

### Customer Writer

You can bring a writer, it just has to be a function which takes an object and returns nothing.

Interface:

```js
export type Writer = (msg: any) => void
```

Example implementation which writes to S3:

```js
import { LogLevel, Logger, Writer } from "dexlog"
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

```js
import { Serializer } from 'dexlog'
export type Serializer = (msg: any) => string
```

Example implementation which returns everything in CAPS!

```js
import { LogLevel, Logger, StdOutWriter, Serializer } from 'dexlog'
const AngrySerializer: Serializer = (msg: any) => JSON.stringify(msg).toUpperCase()
const logger = new Logger(LogLevel.DEBUG, StdOutWriter, AngrySerializer)
logger.error('what?!') // {"MESSAGE":"WHAT?!","LEVEL":"ERROR","TIMESTAMP":"2020-06-23T10:02:03.765Z"}
```

### Custom Stampers

A Stamper returns an object which is appended to your log.

Interface:

```js
export type Stamper = () => any
```

Example implementation which stamps messages with "foo" and a backwards timestamp:

```js
import { DefaultSerializer, Logger, LogLevel, Stamper, StdOutWriter } from 'dexlog'

// timestamper
const locale = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'America/New_York',
})
const FreedomStamper: Stamper = () => ({ time: locale.format(new Date()) })

// foo stamper
const FooStamper: Stamper = () => ({ foo: 'bar' })

// logger
const logger = new Logger(LogLevel.DEBUG, StdOutWriter, DefaultSerializer, [
    FreedomStamper,
    FooStamper,
])

// usage
logger.info('Hello, sir') // {"message":"Hello, World!","level":"INFO","time":"6/23/2020","foo":"bar"}
```
