// Core types for yawc architecture
import type { VNode } from 'snabbdom'

export interface ComponentProperties {
  Type: string
  [key: string]: any
}

export interface ComponentInstance {
  ID: string
  Children?: Record<string, ComponentInstance>
  Properties: ComponentProperties
}

export interface YawcTree {
  Roots: Record<string, ComponentInstance>
  
  // WC - Create component
  create(id: string, properties: ComponentProperties): void
  
  // WS - Set properties
  mergeProps(id: string, properties: Record<string, any>): void
  
  // EX - Expunge/destroy component
  destroy(id: string): void
  
  // Find component by ID
  find(id: string): ComponentInstance | undefined
  
  // Get all components in rendering order
  getComponents(): ComponentInstance[]
}

export interface EWCMessage {
  WC?: { ID: string, Properties: { Type: string, [key: string]: any } }
  WS?: { ID: string, Properties: { [key: string]: any } }
  WG?: { [key: string]: any }
  EX?: { [key: string]: any }
  NQ?: { [key: string]: any }
  Event?: { EventName: string, ID: string, Info?: any }
}

export interface QueuedMessage {
  message: EWCMessage
  callback?: (response: EWCMessage) => void
}

export interface Component {
  mergeDefaults(properties: ComponentProperties): ComponentProperties
  render(component: ComponentInstance): VNode
}

export interface ComponentRegistry {
  [componentType: string]: Component
}

export interface Yawc {
  T: YawcTree  // Tree - global state
  R: Renderer  // Renderer - pluggable rendering system
  W: WebSocketManager  // WebSocket - server communication
  Q: QueueManager  // Queue - message queuing
  C: ComponentRegistry  // Components - component registry
}

export interface Renderer {
  render(id?: string): void
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