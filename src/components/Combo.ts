import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { ComponentInstance, ComponentProperties } from '../types'
import { yawc } from '../yawc'
import { sendEvent } from '../events'

export const Combo = {
  mergeDefaults(properties: ComponentProperties): ComponentProperties {
    const defaults: any = {
      Items: [],
      Text: '',
      SelItems: []
    }
    
    const merged = { ...defaults, ...properties }
    
    // Initialize SelItems to match Items length if not provided
    if (merged.Items.length > 0 && merged.SelItems.length === 0) {
      merged.SelItems = new Array(merged.Items.length).fill(0) as number[]
    }
    
    return merged
  },

  render(component: ComponentInstance): VNode {
    const items = component.Properties?.Items || []
    const text = component.Properties?.Text || ''
    const selItems = component.Properties?.SelItems || []
    
    const style: any = {
      position: 'absolute'
    }
    
    if (component.Properties?.Posn) {
      const [top, left] = component.Properties.Posn
      style.top = `${top}px`
      style.left = `${left}px`
    }
    
    if (component.Properties?.Size) {
      const [height, width] = component.Properties.Size
      style.height = `${height}px`
      style.width = `${width}px`
    }
    
    if (component.Properties?.Style) {
      Object.assign(style, component.Properties.Style)
    }
    
    const options = items.map((item: string, index: number) => 
      h('option', { 
        attrs: { 
          value: item,
          selected: selItems[index] === 1 
        } 
      }, item)
    )
    
    return h('select', {
      attrs: { id: component.ID, value: text },
      style,
      on: {
        change: (event: Event) => {
          const target = event.target as HTMLSelectElement
          const selectedValue = target.value
          const selectedIndex = target.selectedIndex
          
          // Update SelItems bitmask
          const items = component.Properties?.Items || []
          const selItems = new Array(items.length).fill(0)
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            selItems[selectedIndex] = 1
          }
          
          yawc.T.mergeProps(component.ID, { 
            Text: selectedValue,
            SelItems: selItems
          })
          sendEvent(component, 'Select')
        }
      }
    }, options)
  }
}