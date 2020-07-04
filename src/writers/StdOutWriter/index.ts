import { Writer } from '../..'

export const StdOutWriter: Writer = (msg: any) => process.stdout.write(`${msg}\n`)
