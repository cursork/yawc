import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { ComponentInstance, ComponentProperties } from '../types'
import { yawc } from '../yawc'
import { sendEvent } from '../events'

export const Button = {
  mergeDefaults(properties: ComponentProperties): ComponentProperties {
    const defaults = {
      Caption: '',
      State: 0
    }
    
    return { ...defaults, ...properties }
  },

  render(component: ComponentInstance): VNode {
    const caption = component.Properties?.Caption || ''
    const isCheckbox = component.Properties?.Style === 'Check'
    
    const style: Record<string, string> = {
      position: 'absolute',
      border: '1px solid #ccc',
      background: 'white'
    }
    
    if (component.Properties?.Posn) {
      style.top = String(component.Properties.Posn[0]) + 'px'
      style.left = String(component.Properties.Posn[1]) + 'px'
    }
    
    if (component.Properties?.Size) {
      style.height = String(component.Properties.Size[0]) + 'px'
      style.width = String(component.Properties.Size[1]) + 'px'
    }
    
    if (isCheckbox) {
      const checked = component.Properties?.State === 1
      return h('label', {
        attrs: { id: component.ID },
        style
      }, [
        h('input', {
          attrs: { type: 'checkbox', checked },
          on: {
            change: (event: Event) => {
              const target = event.target as HTMLInputElement
              const newState = target.checked ? 1 : 0
              yawc.T.mergeProps(component.ID, { State: newState })
              sendEvent(component, 'Select')
            }
          }
        }),
        ' ' + caption
      ])
    }
    
    return h('button', {
      attrs: { id: component.ID },
      style,
      on: {
        click: () => {
          sendEvent(component, 'Select')
        }
      }
    }, caption)
  }
}