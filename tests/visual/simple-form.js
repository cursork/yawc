import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

class SimpleFormVisualTest {
  constructor() {
    this.server = null
    this.browser = null
    this.page = null
    this.port = 5000 + Math.floor(Math.random() * 1000)
    this.testName = 'simple-form'
    this.referenceDir = join(__dirname, 'references')
    this.actualDir = join(__dirname, 'actual')
  }

  async run(updateReference = false) {
    try {
      await this.startServer()
      await this.initBrowser()
      await this.setupSimpleForm()
      
      const screenshot = await this.captureScreenshot()
      
      if (updateReference) {
        await this.updateReference(screenshot)
        console.log(`✓ Reference image updated for ${this.testName}`)
      } else {
        const result = await this.compareWithReference(screenshot)
        this.reportResult(result)
      }
      
    } finally {
      await this.cleanup()
    }
  }

  async startServer() {
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
  }

  async initBrowser() {
    this.browser = await chromium.launch({ headless: true })
    this.page = await this.browser.newPage()
    
    await this.page.setViewportSize({ width: 800, height: 600 })
    await this.page.goto(`http://localhost:${this.port}`)
    await this.page.waitForLoadState('networkidle')
  }

  async setupSimpleForm() {
    await this.page.evaluate(() => {
      window.yawc.T.Roots = {}
      
      window.yawc.T.create('F1', {
        Type: 'Form',
        Caption: 'Test Form',
        Size: [200, 300],
        BCol: [240, 240, 240]
      })
      
      window.yawc.T.create('F1.L1', {
        Type: 'Label',
        Caption: 'Hello World',
        Posn: [20, 10],
        Size: [20, 100]
      })
      
      window.yawc.T.create('F1.B1', {
        Type: 'Button',
        Caption: 'Click Me',
        Posn: [50, 10],
        Size: [25, 80]
      })
      
      window.yawc.R.render()
    })
    
    await this.page.waitForTimeout(500)
  }

  async captureScreenshot() {
    const appElement = await this.page.$('#app')
    return await appElement.screenshot({ type: 'png' })
  }

  async updateReference(screenshot) {
    const fs = await import('fs')
    if (!fs.existsSync(this.referenceDir)) {
      fs.mkdirSync(this.referenceDir, { recursive: true })
    }
    
    const referencePath = join(this.referenceDir, `${this.testName}.png`)
    writeFileSync(referencePath, screenshot)
  }

  async compareWithReference(screenshot) {
    const referencePath = join(this.referenceDir, `${this.testName}.png`)
    
    if (!existsSync(referencePath)) {
      return {
        status: 'no-reference',
        message: 'No reference image found. Run with --update to create one.'
      }
    }
    
    const fs = await import('fs')
    if (!fs.existsSync(this.actualDir)) {
      fs.mkdirSync(this.actualDir, { recursive: true })
    }
    
    const actualPath = join(this.actualDir, `${this.testName}.png`)
    writeFileSync(actualPath, screenshot)
    
    // Use Playwright's visual comparison
    const { PNG } = await import('pngjs')
    
    const actualPng = PNG.sync.read(screenshot)
    const referencePng = PNG.sync.read(readFileSync(referencePath))
    
    if (actualPng.width !== referencePng.width || actualPng.height !== referencePng.height) {
      return {
        status: 'different',
        message: `Image dimensions differ: actual ${actualPng.width}x${actualPng.height} vs reference ${referencePng.width}x${referencePng.height}`,
        actualPath,
        referencePath
      }
    }
    
    let differentPixels = 0
    const totalPixels = actualPng.width * actualPng.height
    
    for (let i = 0; i < actualPng.data.length; i += 4) {
      const rSame = actualPng.data[i] === referencePng.data[i]
      const gSame = actualPng.data[i + 1] === referencePng.data[i + 1]  
      const bSame = actualPng.data[i + 2] === referencePng.data[i + 2]
      const aSame = actualPng.data[i + 3] === referencePng.data[i + 3]
      
      if (!rSame || !gSame || !bSame || !aSame) {
        differentPixels++
      }
    }
    
    const diffPercentage = (differentPixels / totalPixels) * 100
    const threshold = 0.1
    
    if (diffPercentage > threshold) {
      return {
        status: 'different',
        message: `Images differ by ${diffPercentage.toFixed(2)}% (threshold: ${threshold}%)`,
        actualPath,
        referencePath,
        diffPercentage
      }
    }
    
    return {
      status: 'same',
      message: `Images match (${diffPercentage.toFixed(4)}% difference)`,
      diffPercentage
    }
  }

  reportResult(result) {
    console.log(`\n=== VISUAL TEST: ${this.testName} ===`)
    
    switch (result.status) {
      case 'same':
        console.log(`✓ ${result.message}`)
        break
      case 'different':
        console.log(`✗ ${result.message}`)
        console.log(`  Reference: ${result.referencePath}`)
        console.log(`  Actual: ${result.actualPath}`)
        process.exit(1)
        break
      case 'no-reference':
        console.log(`⚠ ${result.message}`)
        process.exit(1)
        break
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
    if (this.server) {
      this.server.kill()
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const updateReference = process.argv.includes('--update')
  const test = new SimpleFormVisualTest()
  test.run(updateReference).catch(console.error)
}

export { SimpleFormVisualTest }