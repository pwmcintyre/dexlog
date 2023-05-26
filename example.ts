#!/usr/bin/env -S npx ts-node
import { StandardLogger } from './src'
StandardLogger.debug('about to begin')
StandardLogger.warn('cache failure')
StandardLogger.info('user authenticated', { id: '000001' })
StandardLogger.error('failed to complete', { error: new Error('fail') })
