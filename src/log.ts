// Debug flag - can be set via environment variable or build config
const DEBUG_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true'

export function log(...args: any[]): void {
  console.log(...args)
}

export function warn(...args: any[]): void {
  console.warn(...args)
}

export function err(...args: any[]): void {
  console.error(...args)
}

export function dbg(...args: any[]): void {
  if (DEBUG_ENABLED) {
    console.log('DBG', ...args)
  }
}