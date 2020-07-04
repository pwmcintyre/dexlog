import { Logger, LogLevel } from '..'

// parse level from env var and set default logger
const level = (process.env.LOG_LEVEL || 'INFO') as keyof typeof LogLevel

// StandardLogger is a globally available Logger with a JSON Serializer, timstamps with RFC3339 timestamps, and writer to std out
export const StandardLogger = new Logger(LogLevel[level])

export default Logger
