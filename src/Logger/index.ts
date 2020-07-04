import { JSONSerializer } from '../serializers/JSONSerializer'
import { RFC3339Stamper } from '../stampers/RFC3339Stamper'
import { StdOutWriter } from '../writers/StdOutWriter'

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

// Serializer allows consumer to specify their own method of serializing objects into strings
export type Serializer = (msg: any) => string

// Stamper allows extention of the log event, you can sumply any number of stampers which will all apply their stamp to a message
export type Stamper = () => any

// Logger class allows consumer to instantiate a logger with any given level / writer
export class Logger {
    // context holds any extra data to include in all logs from this logger
    private context: any

    constructor(
        private readonly level: LogLevel = LogLevel.INFO,
        private readonly write: Writer = StdOutWriter,
        private readonly serialize: Serializer = JSONSerializer,
        private readonly stamps: Stamper[] = [RFC3339Stamper],
    ) {}

    public debug(message: string, extra?: any): void {
        return this.log(LogLevel.DEBUG, message, extra)
    }
    public info(message: string, extra?: any): void {
        return this.log(LogLevel.INFO, message, extra)
    }
    public warn(message: string, extra?: any): void {
        return this.log(LogLevel.WARN, message, extra)
    }
    public error(message: string, extra?: any): void {
        return this.log(LogLevel.ERROR, message, extra)
    }
    public log(level: LogLevel, message: string, extra?: any): void {
        if (level < this.level) {
            return
        }

        const stamps = this.stamps.reduce((agg, fn) => {
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

        this.write(this.serialize(log))
    }

    // create a new logger, copy this loggers context merged with any new context
    public with(context: any): Logger {
        const l = new Logger(this.level, this.write, this.serialize, this.stamps)
        l.context = { ...this.context, ...context }
        return l
    }
}
