import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { YawcComponent } from '../types'
import { yawc } from '../yawc'

export function renderForm(component: YawcComponent): VNode {
  const children: VNode[] = []
  
  if (component.Children) {
    for (const child of Object.values(component.Children)) {
      children.push(renderChild(child))
    }
  }

  return h('div', {
    attrs: { id: component.ID },
    style: {
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'sans-serif',
      ...component.Properties?.Style
    }
  }, children)
}

function renderChild(component: YawcComponent): VNode {
  // Access renderer through global yawc
  const renderer = (yawc.R as any).componentRenderers?.[component.Type]
  
  if (renderer) {
    return renderer(component)
  }
  
  // Fallback for unknown components
  return h('div', {
    attrs: { id: component.ID },
    style: { border: '1px solid red', padding: '5px', color: 'red' }
  }, `Unknown component: ${component.Type}`)
}