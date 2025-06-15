import { chromium } from 'playwright'
import WebSocket from 'ws'

export class Browser {
  constructor(port, wsPort) {
    this.port = port
    this.wsPort = wsPort
    this.browser = null
    this.page = null
  }

  async init() {
    this.browser = await chromium.launch({ headless: true })
    this.page = await this.browser.newPage()
    
    await this.page.goto(`http://localhost:${this.port}`)
    await this.page.waitForLoadState('networkidle')
    
    // Connect yawc to mock server
    await this.connectToMockServer()
  }

  async connectToMockServer() {
    // Connect yawc to the mock EWC server
    await this.page.evaluate((wsPort) => {
      window.yawc.W.connect(`ws://localhost:${wsPort}`)
    }, this.wsPort)
    
    // Wait a bit for connection to establish
    await this.page.waitForTimeout(500)
  }


  async getHTML() {
    // Get the Form element using yawc tree
    const html = await this.page.evaluate(() => {
      const formComponent = Object.values(window.yawc.T.Roots).find(root => root.Properties.Type === 'Form')
      if (formComponent) {
        const formElement = document.getElementById(formComponent.ID)
        return formElement ? formElement.outerHTML : '<div>Form not found in DOM</div>'
      }
      return '<div>No Form component</div>'
    })
    return html
  }

  async reset() {
    // Reload the page to reset yawc state
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')
    
    // Reconnect to mock server
    await this.connectToMockServer()
  }

  async click(elementId) {
    await this.page.evaluate((id) => {
      const element = document.getElementById(id)
      if (element) {
        element.click()
      }
    }, elementId)
  }
  
  async select(elementId, value) {
    await this.page.evaluate(({ id, val }) => {
      const element = document.getElementById(id)
      if (element && element.tagName === 'SELECT') {
        element.value = val
        element.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, { id: elementId, val: value })
  }
  
  async input(elementId, value) {
    await this.page.evaluate(({ id, val }) => {
      const element = document.getElementById(id)
      if (element && element.tagName === 'INPUT') {
        element.value = val
        element.dispatchEvent(new Event('input', { bubbles: true }))
        element.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, { id: elementId, val: value })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}