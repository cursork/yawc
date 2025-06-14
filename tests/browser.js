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
    // Check element position and clickability
    const elementInfo = await this.page.evaluate((id) => {
      const el = document.getElementById(id)
      if (!el) return 'NOT_FOUND'
      
      const rect = el.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(el)
      
      return {
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        style: {
          position: computedStyle.position,
          zIndex: computedStyle.zIndex,
          pointerEvents: computedStyle.pointerEvents,
          visibility: computedStyle.visibility,
          display: computedStyle.display
        },
        offsetParent: el.offsetParent?.tagName || 'null'
      }
    }, elementId)
    
    console.log('Element info for click:', elementInfo)
    
    // Check how many times the button element exists in DOM
    const buttonCount = await this.page.evaluate((id) => {
      const elements = document.querySelectorAll(`#${id}`)
      console.log(`Found ${elements.length} elements with ID ${id}`)
      
      // Also check if there are multiple buttons in general
      const allButtons = document.querySelectorAll('button')
      console.log(`Total buttons in DOM: ${allButtons.length}`)
      allButtons.forEach((btn, i) => {
        console.log(`Button ${i}: id=${btn.id}, text=${btn.textContent}`)
      })
      
      return elements.length
    }, elementId)
    
    console.log(`Button count: ${buttonCount}`)
    
    // Single click on the first element
    const clickResult = await this.page.evaluate((id) => {
      const element = document.getElementById(id)
      if (element) {
        console.log('About to click element:', element.id)
        element.click()
        return 'clicked_once'
      }
      return 'element_not_found'
    }, elementId)
    
    console.log('Click result:', clickResult)
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}