import { JSONSerializer, LogLevel, Serializer } from '../..'

export enum Colours {
    reset = '\u001b[0m',
    hicolor = '\u001b[1m',
    underline = '\u001b[4m',
    inverse = '\u001b[7m',
    black = '\u001b[30m',
    red = '\u001b[31m',
    green = '\u001b[32m',
    yellow = '\u001b[33m',
    blue = '\u001b[34m',
    magenta = '\u001b[35m',
    cyan = '\u001b[36m',
    white = '\u001b[37m',
    bg_black = '\u001b[40m',
    bg_red = '\u001b[41m',
    bg_green = '\u001b[42m',
    bg_yellow = '\u001b[43m',
    bg_blue = '\u001b[44m',
    bg_magenta = '\u001b[45m',
    bg_cyan = '\u001b[46m',
    bg_white = '\u001b[47m',
}

export const DefaultColourMap: Map<LogLevel, string> = new Map([
    [LogLevel.DEBUG, Colours.bg_cyan + Colours.black],
    [LogLevel.INFO, Colours.bg_green + Colours.black],
    [LogLevel.WARN, Colours.bg_yellow + Colours.black],
    [LogLevel.ERROR, Colours.bg_red + Colours.black],
])

export function wrap(colour: string, key: string): string {
    return `${colour}${key}${Colours.reset}`
}

export function ConsoleSerializer(mapping: Map<LogLevel, string> = DefaultColourMap): Serializer {
    const colours: Map<string, string> = new Map(Array.from(mapping.entries()).map(([k, v]) => [LogLevel[k], v]))
    const mapper = (level: string): string => colours.get(level) || Colours.reset
    return (msg: any) => {
        const { level, message, ...rest } = msg
        return `${wrap(mapper(level), level)} ${message} ${ rest && Object.keys(rest).length ? JSONSerializer(rest) : '' }`
    }
}
