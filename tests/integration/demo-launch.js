import { chromium } from 'playwright'
import { spawn } from 'child_process'

class DemoLaunchTest {
  constructor() {
    this.server = null
    this.browser = null
    this.page = null
    this.port = 5000 + Math.floor(Math.random() * 1000)
    this.demoPort = 22323
    this.missingComponents = new Set()
  }

  async run() {
    try {
      await this.startYawcServer()
      await this.initBrowser()
      await this.connectToDemo()
      await this.analyzeComponents()
      this.reportFindings()
      
    } finally {
      await this.cleanup()
    }
  }

  async startYawcServer() {
    this.server = spawn('npx', ['vite', '--port', this.port.toString()], {
      stdio: 'pipe'
    })

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server timeout')), 10000)
      
      this.server.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('Local:') && output.includes(this.port)) {
          clearTimeout(timeout)
          setTimeout(resolve, 1000)
        }
      })
    })
    
    console.log(`yawc server started on port ${this.port}`)
  }

  async initBrowser() {
    this.browser = await chromium.launch({ 
      headless: false,
      devtools: true 
    })
    this.page = await this.browser.newPage()
    
    await this.page.goto(`http://localhost:${this.port}`)
    await this.page.waitForLoadState('networkidle')
  }

  async connectToDemo() {
    console.log(`Connecting to demo server on port ${this.demoPort}...`)
    
    await this.page.evaluate((demoPort) => {
      // Clear demo state and prevent future demo creation
      window.yawc.T.Roots = {}
      
      // Override createExample to prevent it from running again
      if (typeof window.createExample !== 'undefined') {
        window.createExample = () => console.log('createExample disabled for demo test')
      }
      
      window.yawc.R.render()
      
      // Log received components and connection status
      window._receivedComponents = []
      window._connectionLog = []
      
      // Log connection events
      const originalConnect = window.yawc.W.connect
      window.yawc.W.connect = function(url) {
        console.log('Attempting to connect to:', url)
        window._connectionLog.push(`Connecting to: ${url}`)
        return originalConnect.call(this, url)
      }
      
      // Override WebSocket to log events
      const originalWS = window.WebSocket
      window.WebSocket = function(url, protocols) {
        console.log('Creating WebSocket to:', url)
        const ws = new originalWS(url, protocols)
        
        ws.addEventListener('open', () => {
          console.log('WebSocket opened successfully')
          window._connectionLog.push('WebSocket opened')
        })
        
        ws.addEventListener('error', (error) => {
          console.error('WebSocket error:', error)
          window._connectionLog.push(`WebSocket error: ${error}`)
        })
        
        ws.addEventListener('close', (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          window._connectionLog.push(`WebSocket closed: ${event.code} ${event.reason}`)
        })
        
        ws.addEventListener('message', (event) => {
          console.log('WebSocket message received:', event.data)
          window._connectionLog.push(`Message received: ${event.data}`)
        })
        
        return ws
      }
      
      // Set up message handlers BEFORE connecting
      window.yawc.W.onWC((data) => {
        console.log('WC message received:', data)
        window._receivedComponents.push(data)
        
        if (!data.ID) {
          console.error('WC message missing ID:', data)
          return
        }
        if (!data.Properties.Type) {
          console.error('WC message missing Type in Properties:', data)
          return
        }
        window.yawc.T.create(data.ID, data.Properties.Type, data.Properties)
        window.yawc.R.render()
      })
      
      window.yawc.W.onWS((data) => {
        console.log('WS message received:', data)
        if (!data.ID) {
          console.error('WS message missing ID:', data)
          return
        }
        if (!data.Properties) {
          console.error('WS message missing Properties:', data)
          return
        }
        window.yawc.T.mergeProps(data.ID, data.Properties)
        window.yawc.R.render()
      })
      
      window.yawc.W.onEX((data) => {
        console.log('EX message received (destroy):', data)
        if (data.ID) {
          window.yawc.T.destroy(data.ID)
          window.yawc.R.render()
        }
      })
      
      // Log all tree changes
      const originalCreate = window.yawc.T.create
      window.yawc.T.create = function(...args) {
        console.log('Tree.create called:', args)
        return originalCreate.apply(this, args)
      }
      
      const originalDestroy = window.yawc.T.destroy
      window.yawc.T.destroy = function(...args) {
        console.log('Tree.destroy called:', args)
        return originalDestroy.apply(this, args)
      }
      
      // Connect AFTER handlers are set up
      window.yawc.W.connect(`ws://localhost:${demoPort}`)
    }, this.demoPort)
    
    // Wait for connection attempt
    await this.page.waitForTimeout(3000)
    
    // Check connection status
    const connectionStatus = await this.page.evaluate(() => {
      return {
        isConnected: window.yawc.W.isConnected(),
        log: window._connectionLog
      }
    })
    
    console.log('Connection status:', connectionStatus.isConnected)
    if (connectionStatus.log.length > 0) {
      console.log('Connection log:')
      connectionStatus.log.forEach(entry => console.log(`  ${entry}`))
    }
  }

  async analyzeComponents() {
    const results = await this.page.evaluate(() => {
      const componentTypes = new Set()
      const hasRenderer = {}
      const resourceTypes = new Set(['BitMap']) // Types that don't need renderers
      
      window._receivedComponents.forEach(comp => {
        const type = comp.Properties.Type
        componentTypes.add(type)
        
        if (resourceTypes.has(type)) {
          hasRenderer[type] = 'RESOURCE' // Special marker for resource types
        } else {
          hasRenderer[type] = !!(window.yawc.R.componentRenderers && 
                                window.yawc.R.componentRenderers[type])
        }
      })
      
      return {
        componentTypes: Array.from(componentTypes),
        hasRenderer,
        components: window.yawc.T.getComponents().map(c => ({
          ID: c.ID, 
          Type: c.Properties.Type
        }))
      }
    })
    
    console.log('\nReceived components:')
    results.components.forEach(comp => {
      console.log(`  ${comp.Type} (${comp.ID})`)
    })
    
    console.log('\nComponent renderer status:')
    results.componentTypes.forEach(type => {
      if (results.hasRenderer[type] === 'RESOURCE') {
        console.log(`  ${type} ✓ RESOURCE`)
      } else {
        const status = results.hasRenderer[type] ? '✓' : '✗ MISSING'
        console.log(`  ${type} ${status}`)
        if (!results.hasRenderer[type]) {
          this.missingComponents.add(type)
        }
      }
    })
  }

  reportFindings() {
    console.log('\n=== DEMO LAUNCH TEST RESULTS ===')
    
    if (this.missingComponents.size > 0) {
      console.log('\nMissing component implementations:')
      this.missingComponents.forEach(type => {
        console.log(`  - ${type}`)
      })
    } else {
      console.log('\n✓ All components have renderers!')
    }
  }

  async cleanup() {
    console.log('\nPress Ctrl+C to exit...')
    // Keep browser open for inspection
    await new Promise(() => {}) // Wait indefinitely
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new DemoLaunchTest()
  test.run().catch(console.error)
}

export { DemoLaunchTest }