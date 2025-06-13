import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { YawcComponent } from '../types'
import { yawc } from '../yawc'

export function renderSubForm(component: YawcComponent): VNode {
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

function renderChild(component: YawcComponent): VNode {
  const componentType = component.Properties.Type
  const renderer = (yawc.R as any).componentRenderers?.[componentType]
  
  if (renderer) {
    return renderer(component)
  }
  
  // Fallback for unknown components
  return h('div', {
    attrs: { id: component.ID },
    style: { border: '1px solid red', padding: '5px', color: 'red' }
  }, `Unknown component: ${componentType}`)
}