#!/usr/bin/env -S npx ts-node
import { performance } from 'perf_hooks'
import { LogLevel, StandardLogger } from './src'

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

// return a random log level
const keys = Object.keys(LogLevel).filter((k) => typeof LogLevel[k as keyof typeof LogLevel] === 'number')
const randLevel = () => {
    const index = Math.floor(Math.random() * keys.length)
    return LogLevel[keys[index] as keyof typeof LogLevel]
}

// run tests
;[
    run('simple', () => StandardLogger.info( 'hi')),
    run('error', () => StandardLogger.info( 'hi', { error: new Error('fail') })),
    run('extra', () => StandardLogger.info( 'hi', { extra: 'abcd' })),
    run('with simple', () => StandardLogger.with({ with: 'abcd' }).info( 'hi')),
    run('with extra', () => StandardLogger.with({ with: 'abcd' }).info( 'hi', { extra: 'abcd' })),
    run('rainbow level', () => StandardLogger.log( randLevel(), 'thing', { extra: 'abcd' })),
].forEach((a) => console.log(a))
