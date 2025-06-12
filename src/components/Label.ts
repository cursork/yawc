import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { YawcComponent } from '../types'

export function renderLabel(component: YawcComponent): VNode {
  const caption = component.Properties?.Caption || ''
  
  return h('label', {
    attrs: { id: component.ID },
    style: {
      display: 'block',
      margin: '5px 0',
      ...component.Properties?.Style
    }
  }, caption)
}