import type { QueueManager, EWCMessage, QueuedMessage } from './types'
import { warn } from './log'

export class Queue implements QueueManager {
  private queue: QueuedMessage[] = []
  private processing = false
  private timeoutMs = 5000 // 5 second timeout for responses

  send(message: EWCMessage, callback?: (response: EWCMessage) => void): void {
    const queuedMessage: QueuedMessage = { message, callback }
    this.queue.push(queuedMessage)
    
    if (!this.processing) {
      this.processNext()
    }
  }

  private processNext(): void {
    if (this.queue.length === 0) {
      this.processing = false
      return
    }

    this.processing = true
    const queuedMessage = this.queue.shift()!
    
    // If no callback, send immediately and continue
    if (!queuedMessage.callback) {
      this.sendMessage(queuedMessage.message)
      this.processNext()
      return
    }

    // Set up response handling with timeout
    const timeoutId = setTimeout(() => {
      warn('Queue message timeout:', queuedMessage.message)
      this.processNext()
    }, this.timeoutMs)

    // Send message and wait for response
    this.sendMessage(queuedMessage.message)
    
    // This is a simplified approach - in reality we'd need to match responses
    // to specific requests. For now, assume next NQ response is for this request.
    const handleResponse = (response: EWCMessage) => {
      if (response.NQ) {
        clearTimeout(timeoutId)
        queuedMessage.callback!(response)
        this.processNext()
        // Remove this handler after use
        // In real implementation, we'd match request/response IDs
      }
    }

    // Register temporary response handler
    // This is a simplified approach - real implementation would be more sophisticated
    (globalThis as any).__tempQueueHandler = handleResponse
  }

  private sendMessage(message: EWCMessage): void {
    // Import yawc here to avoid circular dependencies
    const { yawc } = require('./yawc')
    yawc.W.send(message)
  }

  handleResponse(response: EWCMessage): void {
    const handler = (globalThis as any).__tempQueueHandler
    if (handler) {
      handler(response)
      delete (globalThis as any).__tempQueueHandler
    }
  }

  // Clear the queue (useful for cleanup or reset)
  clear(): void {
    this.queue = []
    this.processing = false
  }

  // Get queue status
  getStatus(): { length: number, processing: boolean } {
    return {
      length: this.queue.length,
      processing: this.processing
    }
  }
}