#!/usr/bin/env -S npx ts-node
import { performance } from 'perf_hooks'
import { Logger, LogLevel } from './src'

// test runner
function run(name: string, fn: () => any, count: number = 1000) {
    // collect results
    const times: number[] = []
    for (let i = count; i > 0; i--) {
        // run function
        const t0 = performance.now()
        fn()
        const t1 = performance.now()

        // save result
        times.push(t1 - t0)
    }

    // calculate results
    const sum = times.reduce((a, b) => a + b, 0)
    const avg = sum / times.length || 0

    return { name, sum, avg, count }
}

// setup
const NullWriter = () => null
const logger = new Logger({ level: LogLevel.INFO, write: NullWriter })

// run tests
;[
    run('simple', () => logger.info('hi')),
    run('error', () => logger.info('hi', { error: new Error('fail') })),
    run('extra', () => logger.info('hi', { extra: 'abcd' })),
    run('with simple', () => logger.with({ with: 'abcd' }).info('hi')),
    run('with extra', () => logger.with({ with: 'abcd' }).info('hi', { extra: 'abcd' })),
].forEach((a) => console.log(a))
