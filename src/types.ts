// Core types for yawc architecture
export interface YawcComponent {
  ID: string
  Type: string
  Children?: Record<string, YawcComponent>
  Properties?: Record<string, any>
}

export interface YawcTree {
  Roots: Record<string, YawcComponent>
}

export interface EWCMessage {
  WC?: { Type: string, [key: string]: any }
  WS?: { [key: string]: any }
  WG?: { [key: string]: any }
  EX?: { [key: string]: any }
  NQ?: { [key: string]: any }
}

export interface QueuedMessage {
  message: EWCMessage
  callback?: (response: EWCMessage) => void
}

export interface Yawc {
  T: YawcTree  // Tree - global state
  R: Renderer  // Renderer - pluggable rendering system
  W: WebSocketManager  // WebSocket - server communication
  Q: QueueManager  // Queue - message queuing
}

export interface Renderer {
  render(id?: string): void
}

export interface WebSocketManager {
  connect(url: string): void
  send(message: EWCMessage): void
  onMessage(handler: (message: EWCMessage) => void): void
}

export interface QueueManager {
  send(message: EWCMessage, callback?: (response: EWCMessage) => void): void
}