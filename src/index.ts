// LogLevel allows consumer to set the minimum log level
// eg. when set to INFO, using debug() will do nothing
export enum LogLevel {
    DEBUG = 0,
    INFO,
    WARN,
    ERROR,
}

// Writer allows consumer to specify their own method of writing
// eg. they could use a file writer, HTTP streamer, etc
export type Writer = (msg: any) => void
export const StdOutWriter = (msg: any) => process.stdout.write(`${ msg }\n`)

// Serializer allows consumer to specify their own method of serializing objects into strings
export type Serializer = (msg: any) => string
export const DefaultSerializer = (msg: any) => JSON.stringify(msg, getCircularReplacer())

// Stamper allows extention of the log event, you can sumply any number of stampers which will all apply their stamp to a message
export type Stamper = () => any
export const RFC3339Stamper = () => ({ timestamp: new Date().toISOString() })

// getCircularReplacer is Mozilla's suggested approach to dealing with circular references
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
function getCircularReplacer () {
    const seen = new WeakSet()
    return (key: any, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return
            }
            seen.add(value)
        }
        return replaceErrors(key, value)
    }
}
function replaceErrors(_: any, value: any) {
    if (value instanceof Error) return value.toString()
    return value
}

// Logger class allows consumer to instantiate a logger with any given level / writer
export class Logger {

    // context holds any extra data to include in all logs from this logger
    private context: any

    constructor(
        private readonly Level: LogLevel = LogLevel.INFO,
        private readonly write: Writer = StdOutWriter,
        private readonly serialize: Serializer = DefaultSerializer,
        private readonly stamps: Stamper[] = [RFC3339Stamper],
    ) { }

    public debug(message: string, extra?: any): void {
        return this.log( LogLevel.DEBUG, message, extra )
    }
    public info(message: string, extra?: any): void {
        return this.log( LogLevel.INFO, message, extra )
    }
    public warn(message: string, extra?: any): void {
        return this.log( LogLevel.WARN, message, extra )
    }
    public error(message: string, extra?: any): void {
        return this.log( LogLevel.ERROR, message, extra )
    }
    public log(level: LogLevel, message: string, extra?: any): void {

        if ( level < this.Level ) {
            return
        }

        const stamps = this.stamps.reduce( (agg, fn) => {
            agg = { ...fn(), ...agg }
            return agg
        }, {})

        const log = {
            message,
            level: LogLevel[level],
            ...stamps,
            ...this.context,
            ...extra,
        }

        this.write( this.serialize(log) )

    }

    // create a new logger, copy this loggers context merged with any new context
    public with(context: any): Logger {
        const l = new Logger( this.Level, this.write, this.serialize, this.stamps )
        l.context = { ...this.context, ...context }
        return l
    }

}

// parse level from env var and set default logger
const level = ( process.env.LOG_LEVEL || "INFO" ) as keyof typeof LogLevel

// StandardLogger is a globally available Logger with a JSON Serializer, timstamps with RFC3339 timestamps, and writer to std out
export const StandardLogger = new Logger( LogLevel[level] )

export default Logger
