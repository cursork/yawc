// Core types for yawc architecture
export interface ComponentProperties {
  Type: string
  [key: string]: any
}

export interface YawcComponent {
  ID: string
  Children?: Record<string, YawcComponent>
  Properties: ComponentProperties
}

export interface YawcTree {
  Roots: Record<string, YawcComponent>
  
  // WC - Create component
  create(id: string, properties: ComponentProperties): void
  
  // WS - Set properties
  mergeProps(id: string, properties: Record<string, any>): void
  
  // EX - Expunge/destroy component
  destroy(id: string): void
  
  // Find component by ID
  find(id: string): YawcComponent | undefined
  
  // Get all components in rendering order
  getComponents(): YawcComponent[]
}

export interface EWCMessage {
  WC?: { ID: string, Properties: { Type: string, [key: string]: any } }
  WS?: { ID: string, Properties: { [key: string]: any } }
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
  
  // Register custom component renderer
  registerComponent(type: string, renderer: (component: YawcComponent) => any): void
}

export interface WebSocketManager {
  connect(url: string): void
  send(message: EWCMessage): void
  onMessage(handler: (message: EWCMessage) => void): void
  
  // Specific message type handlers
  onWC(handler: (data: any) => void): void
  onWS(handler: (data: any) => void): void
  onWG(handler: (data: any) => void): void
  onEX(handler: (data: any) => void): void
  onNQ(handler: (data: any) => void): void
  
  // Connection management
  disconnect(): void
  isConnected(): boolean
}

export interface QueueManager {
  send(message: EWCMessage, callback?: (response: EWCMessage) => void): void
  handleResponse(response: EWCMessage): void
  clear(): void
  getStatus(): { length: number, processing: boolean }
}