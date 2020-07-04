import { Stamper } from '../..'

export const RFC3339Stamper: Stamper = () => ({ timestamp: new Date().toISOString() })
