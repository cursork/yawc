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
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('T: ')) {
        // T: messages are sent TO yawc (from mock server)
        const json = trimmed.substring(3)
        this.mockServer.queueMessage(JSON.parse(json))
      } else if (trimmed.startsWith('R: ')) {
        // R: messages are expected FROM yawc (to mock server)
        const json = trimmed.substring(3)
        this.mockServer.expectMessage(JSON.parse(json))
      }
    }
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