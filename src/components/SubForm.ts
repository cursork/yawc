import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { ComponentInstance, ComponentProperties } from '../types'
import { yawc } from '../yawc'

export const SubForm = {
  mergeDefaults(properties: ComponentProperties): ComponentProperties {
    const defaults = {}
    return { ...defaults, ...properties }
  },

  render(component: ComponentInstance): VNode {
    const children: VNode[] = []
    
    if (component.Children) {
      for (const child of Object.values(component.Children)) {
        children.push(renderChild(child))
      }
    }

    return h('div', {
      attrs: { id: component.ID },
      style: {
        padding: '10px',
        border: '1px solid #ccc',
        margin: '5px',
        ...component.Properties?.Style
      }
    }, children)
  }
}

function renderChild(component: ComponentInstance): VNode {
  return (yawc.R as any).renderComponent(component)
}