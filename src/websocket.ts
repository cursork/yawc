import type { WebSocketManager, EWCMessage } from './types'

export class WebSocketManager implements WebSocketManager {
  private ws: WebSocket | null = null
  private messageHandlers: {
    WC?: (data: any) => void
    WS?: (data: any) => void
    WG?: (data: any) => void
    EX?: (data: any) => void
    NQ?: (data: any) => void
  } = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(url: string): void {
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message: EWCMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.attemptReconnect(url)
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  send(message: EWCMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message:', message)
    }
  }

  onMessage(handler: (message: EWCMessage) => void): void {
    // Legacy support - convert to specific handlers
    this.messageHandlers.WC = (data) => handler({ WC: data })
    this.messageHandlers.WS = (data) => handler({ WS: data })
    this.messageHandlers.WG = (data) => handler({ WG: data })
    this.messageHandlers.EX = (data) => handler({ EX: data })
    this.messageHandlers.NQ = (data) => handler({ NQ: data })
  }

  onWC(handler: (data: any) => void): void {
    this.messageHandlers.WC = handler
  }

  onWS(handler: (data: any) => void): void {
    this.messageHandlers.WS = handler
  }

  onWG(handler: (data: any) => void): void {
    this.messageHandlers.WG = handler
  }

  onEX(handler: (data: any) => void): void {
    this.messageHandlers.EX = handler
  }

  onNQ(handler: (data: any) => void): void {
    this.messageHandlers.NQ = handler
  }

  private handleMessage(message: EWCMessage): void {
    if (message.WC && this.messageHandlers.WC) {
      this.messageHandlers.WC(message.WC)
    } else if (message.WS && this.messageHandlers.WS) {
      this.messageHandlers.WS(message.WS)
    } else if (message.WG && this.messageHandlers.WG) {
      this.messageHandlers.WG(message.WG)
    } else if (message.EX && this.messageHandlers.EX) {
      this.messageHandlers.EX(message.EX)
    } else if (message.NQ && this.messageHandlers.NQ) {
      this.messageHandlers.NQ(message.NQ)
    }
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect(url)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}