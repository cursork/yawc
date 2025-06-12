import { Tree } from './tree'
import { SnabbdomRenderer } from './renderer'
import { WS } from './websocket'
import { Queue } from './queue'
import type { Yawc } from './types'

// Global yawc instance
export const yawc: Yawc = {
  T: new Tree(),
  R: new SnabbdomRenderer(),
  W: new WS(),
  Q: new Queue()
}

// Make yawc available globally in browser
if (typeof window !== 'undefined') {
  (window as any).yawc = yawc
}