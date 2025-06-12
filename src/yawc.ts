import { Tree } from './tree'
import { SnabbdomRenderer } from './renderer'
import { WebSocketManager } from './websocket'
import { QueueManager } from './queue'
import type { Yawc } from './types'

// Global yawc instance
export const yawc: Yawc = {
  T: new Tree(),
  R: new SnabbdomRenderer(),
  W: new WebSocketManager(),
  Q: new QueueManager()
}

// Make yawc available globally in browser
if (typeof window !== 'undefined') {
  (window as any).yawc = yawc
}