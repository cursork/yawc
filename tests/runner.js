import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { Browser } from './browser.js'
import { differ } from './differ.js'
import { MockEWCServer } from './mock-server.js'

class TestRunner {
  constructor() {
    this.server = null
    this.mockServer = null
    this.browser = null
    this.port = 0
    this.wsPort = 0
  }

  async run() {
    try {
      await this.startMockServer()
      await this.startServer()
      this.browser = new Browser(this.port, this.wsPort)
      await this.browser.init()
      
      const testCases = this.getTestCases()
      let passed = 0
      let failed = 0

      for (const testCase of testCases) {
        console.log(`Running test: ${testCase}`)
        try {
          await this.runTest(testCase)
          console.log(`✓ ${testCase}`)
          passed++
        } catch (error) {
          console.log(`✗ ${testCase}: ${error.message}`)
          failed++
        }
      }

      console.log(`\nResults: ${passed} passed, ${failed} failed`)
      
    } finally {
      await this.cleanup()
    }
  }

  async startMockServer() {
    this.wsPort = 8000 + Math.floor(Math.random() * 1000)
    this.mockServer = new MockEWCServer(this.wsPort)
    await this.mockServer.start()
    console.log(`Mock EWC server started on port ${this.wsPort}`)
  }

  async startServer() {
    this.port = 5000 + Math.floor(Math.random() * 1000)
    
    this.server = spawn('npx', ['vite', '--port', this.port.toString()], {
      stdio: 'pipe'
    })

    // Wait for server to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server timeout')), 10000)
      
      this.server.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('Local:') && output.includes(this.port)) {
          clearTimeout(timeout)
          setTimeout(resolve, 1000) // Give it a moment to fully start
        }
      })
      
      this.server.stderr.on('data', (data) => {
        console.error('Server error:', data.toString())
      })
    })
  }

  getTestCases() {
    const casesDir = path.join(process.cwd(), 'tests', 'cases')
    return fs.readdirSync(casesDir)
      .filter(name => fs.statSync(path.join(casesDir, name)).isDirectory())
  }

  async runTest(testCase) {
    const testDir = path.join(process.cwd(), 'tests', 'cases', testCase)
    const messagesFile = path.join(testDir, 'messages.txt')
    const expectedFile = path.join(testDir, 'expected.html')

    if (!fs.existsSync(messagesFile) || !fs.existsSync(expectedFile)) {
      throw new Error('Missing test files')
    }

    const messages = fs.readFileSync(messagesFile, 'utf8')
    const expected = fs.readFileSync(expectedFile, 'utf8')

    // Reset mock server for this test
    this.mockServer.messageQueue = []
    this.mockServer.expectedMessages = []
    
    await this.browser.reset()
    await this.processMessages(messages)
    
    // Wait a bit for all processing to complete
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const actual = await this.browser.getHTML()
    
    if (!differ.compare(actual, expected)) {
      throw new Error('HTML mismatch')
    }
    
    // Check if all expected messages were received
    const unmet = this.mockServer.getUnmetExpectations()
    if (unmet.length > 0) {
      throw new Error(`Unmet expectations: ${JSON.stringify(unmet)}`)
    }
  }

  async processMessages(messages) {
    const lines = messages.split('\n').filter(line => line.trim())
    
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      
      if (trimmed.startsWith('T: ')) {
        // T: messages are sent TO yawc (from mock server)
        const json = trimmed.substring(3)
        const message = JSON.parse(json)
        console.log('Queueing message:', message)
        this.mockServer.queueMessage(message)
      } else if (trimmed.startsWith('R: ')) {
        // Skip R: if previous line was U: (already pre-processed)
        if (i > 0 && lines[i - 1].trim().startsWith('U: ')) {
          continue
        }
        
        // R: messages are expected FROM yawc (to mock server)
        const json = trimmed.substring(3)
        this.mockServer.expectMessage(JSON.parse(json))
      } else if (trimmed.startsWith('U: ')) {
        // U: user actions to simulate
        const json = trimmed.substring(3)
        const action = JSON.parse(json)
        
        // Check if next line is R: and set expectation first
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('R: ')) {
          const nextJson = lines[i + 1].trim().substring(3)
          this.mockServer.expectMessage(JSON.parse(nextJson))
        }
        
        // TODO: This 2000ms delay is masking a timing issue - should be removed
        // after fixing the real problem with event handler attachment
        await new Promise(resolve => setTimeout(resolve, 2000))
        await this.simulateUserAction(action)
      }
    }
  }

  async simulateUserAction(action) {
    const { Action, ID, Value } = action
    
    // Debug: Check what elements exist before clicking
    const elements = await this.browser.page.evaluate((targetId) => {
      const allElements = Array.from(document.querySelectorAll('[id]')).map(el => ({
        id: el.id,
        tagName: el.tagName,
        visible: el.offsetParent !== null
      }))
      console.log('All elements with IDs:', allElements)
      
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        const computedStyle = window.getComputedStyle(targetElement)
        console.log(`Target element ${targetId}:`, {
          tagName: targetElement.tagName,
          style: targetElement.style.cssText,
          visible: targetElement.offsetParent !== null,
          rect: targetElement.getBoundingClientRect(),
          computedStyle: {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            width: computedStyle.width,
            height: computedStyle.height
          }
        })
      } else {
        console.log(`Target element ${targetId}: NOT FOUND`)
      }
      
      return allElements
    }, ID)
    
    console.log(`Available elements:`, elements)
    
    switch (Action) {
      case 'click':
        await this.browser.click(ID)
        break
      case 'select':
        await this.browser.select(ID, Value)
        break
      case 'input':
        await this.browser.input(ID, Value)
        break
      default:
        throw new Error(`Unknown user action: ${Action}`)
    }
    
    // Wait a bit for the action to be processed
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
    if (this.mockServer) {
      await this.mockServer.stop()
    }
    if (this.server) {
      this.server.kill()
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner()
  runner.run().catch(console.error)
}

export { TestRunner }