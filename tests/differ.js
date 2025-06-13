import { JSDOM } from 'jsdom'
import { diffLines } from 'diff'

class HTMLDiffer {
  compare(actual, expected) {
    try {
      const normalizedActual = this.normalize(actual)
      const normalizedExpected = this.normalize(expected)
      
      if (normalizedActual === normalizedExpected) {
        return true
      }

      // Show diff if they don't match
      this.showDiff(normalizedActual, normalizedExpected)
      return false
    } catch (error) {
      console.error('Error comparing HTML:', error.message)
      return false
    }
  }

  normalize(html) {
    const dom = new JSDOM(html)
    const element = dom.window.document.body.firstChild || dom.window.document.documentElement
    
    return this.normalizeElement(element)
  }

  normalizeElement(element) {
    if (!element) return ''
    
    if (element.nodeType === 3) { // Text node
      return element.textContent.trim()
    }
    
    if (element.nodeType !== 1) { // Not an element
      return ''
    }

    const tag = element.tagName.toLowerCase()
    const attrs = this.normalizeAttributes(element)
    const children = Array.from(element.childNodes)
      .map(child => this.normalizeElement(child))
      .filter(child => child.length > 0)
      .join('')

    if (children) {
      return `<${tag}${attrs}>${children}</${tag}>`
    } else {
      return `<${tag}${attrs}></${tag}>`
    }
  }

  normalizeAttributes(element) {
    const attrs = []
    
    // Get all attributes except snabbdom internals
    for (const attr of element.attributes) {
      if (!this.isIgnoredAttribute(attr.name)) {
        attrs.push(`${attr.name}="${attr.value}"`)
      }
    }
    
    // Sort for consistent output
    attrs.sort()
    
    return attrs.length > 0 ? ' ' + attrs.join(' ') : ''
  }

  isIgnoredAttribute(name) {
    // Ignore snabbdom and framework-specific attributes
    const ignored = [
      'data-vnode',
      'data-snabbdom',
      'data-hook'
    ]
    return ignored.some(pattern => name.includes(pattern))
  }

  showDiff(actual, expected) {
    console.log('\nHTML Diff:')
    console.log('Expected:')
    console.log(expected)
    console.log('\nActual:')
    console.log(actual)
    
    const diff = diffLines(expected, actual)
    console.log('\nDifferences:')
    
    diff.forEach(part => {
      if (part.added) {
        console.log('\x1b[32m+', part.value.trim(), '\x1b[0m')
      } else if (part.removed) {
        console.log('\x1b[31m-', part.value.trim(), '\x1b[0m')
      }
    })
  }
}

export const differ = new HTMLDiffer()