import { JSONSerializer, Logger, LogLevel, Serializer } from '..'
import { ConsoleSerializer } from '../serializers/ConsoleSerializer'

// parse level from env var and set default logger
const level = (process.env.LOG_LEVEL || 'INFO') as keyof typeof LogLevel

// parse format from env var and set default serializer
const serialize = ((format: string): Serializer => {
    switch (format.toUpperCase()) {
        case 'TEXT':
            return ConsoleSerializer()
        default:
            return JSONSerializer
    }
})(process.env.LOG_FORMAT || '')

// StandardLogger is a globally available Logger with a JSON Serializer, timstamps with RFC3339 timestamps, and writer to std out
export const StandardLogger = new Logger({
    level: LogLevel[level],
    serialize,
})

export default Logger
