import { JSONSerializer, Serializer } from '../..';

// colours enum
export enum Colours {
    Reset = '\x1b[0m',
    Bright = '\x1b[1m',
    Dim = '\x1b[2m',
    Underscore = '\x1b[4m',
    Blink = '\x1b[5m',
    Reverse = '\x1b[7m',
    Hidden = '\x1b[8m',

    FgBlack = '\x1b[30m',
    FgRed = '\x1b[31m',
    FgGreen = '\x1b[32m',
    FgYellow = '\x1b[33m',
    FgBlue = '\x1b[34m',
    FgMagenta = '\x1b[35m',
    FgCyan = '\x1b[36m',
    FgWhite = '\x1b[37m',

    BgBlack = '\x1b[40m',
    BgRed = '\x1b[41m',
    BgGreen = '\x1b[42m',
    BgYellow = '\x1b[43m',
    BgBlue = '\x1b[44m',
    BgMagenta = '\x1b[45m',
    BgCyan = '\x1b[46m',
    BgWhite = '\x1b[47m'
}

// colour level map
export const LevelColours: Colours[] = [
    Colours.FgCyan, //debug
    Colours.FgGreen, //info
    Colours.FgYellow, //warn
    Colours.FgRed, //error
    Colours.FgRed, //fatal
]

const colors = {
    DEBUG: Colours.FgCyan,
    INFO: Colours.FgGreen,
    WARNING: Colours.FgYellow,
    ERROR: Colours.FgRed,
    FATAL: Colours.FgRed,
};

function getColor(level: string): Colours {
    switch (level) {
        case "DEBUG":
            return Colours.FgCyan
        case "INFO":
            return Colours.FgGreen
        case "WARNING":
            return Colours.FgYellow
        case "ERROR":
            return Colours.FgRed
        case "FATAL":
            return Colours.FgRed
        default:
            return Colours.Reset;
    }
}

function wrap(colour: Colours, key: string): string {
    return `${colour}${key}${Colours.Reset}`
}

export const ConsoleSerializer: Serializer = (msg: any) => {
    const { level, message, timestamp, ...rest } = msg
    return `${wrap(getColor(level), level)} | ${message}\n\t${JSONSerializer(rest)}`
}
