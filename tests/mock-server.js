import WebSocket, { WebSocketServer } from 'ws'

export class MockEWCServer {
  constructor(port) {
    this.port = port
    this.wss = null
    this.clients = new Set()
    this.messageQueue = []
    this.expectedMessages = []
  }

  async start() {
    return new Promise((resolve) => {
      this.wss = new WebSocketServer({ port: this.port })
      
      this.wss.on('connection', (ws) => {
        this.clients.add(ws)
        console.log(`Mock server: Client connected on port ${this.port}`)
        
        // Send queued messages to new client
        this.messageQueue.forEach(msg => {
          ws.send(JSON.stringify(msg))
        })
        
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString())
          this.handleClientMessage(message, ws)
        })
        
        ws.on('close', () => {
          this.clients.delete(ws)
        })
      })
      
      this.wss.on('listening', resolve)
    })
  }

  queueMessage(message) {
    this.messageQueue.push(message)
    // Send to any already connected clients
    this.broadcast(message)
  }

  expectMessage(message) {
    this.expectedMessages.push(message)
  }

  handleClientMessage(message, fromClient) {
    console.log('Mock server received:', message)
    console.log('Current client count:', this.clients.size)
    
    // Add a unique ID to each client for debugging
    if (!fromClient._debugId) {
      fromClient._debugId = Math.random().toString(36).substr(2, 9)
    }
    console.log('Message from client ID:', fromClient._debugId)
    
    // Check if this matches any expected message
    const expectedIndex = this.expectedMessages.findIndex(expected => {
      const expectedJson = JSON.stringify(expected)
      const messageJson = JSON.stringify(message)
      const matches = expectedJson === messageJson
      
      if (!matches && message.Event) {
        console.log('Event message comparison:')
        console.log('Expected:', expectedJson)
        console.log('Received:', messageJson)
      }
      
      return matches
    })
    
    if (expectedIndex >= 0) {
      this.expectedMessages.splice(expectedIndex, 1)
      console.log('Mock server: Expected message received')
    } else {
      console.warn('Mock server: Unexpected message:', message)
    }
  }

  broadcast(message) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  getUnmetExpectations() {
    return this.expectedMessages
  }

  async stop() {
    if (this.wss) {
      this.clients.forEach(client => client.close())
      this.wss.close()
    }
  }
}