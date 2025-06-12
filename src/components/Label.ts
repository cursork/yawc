import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { YawcComponent } from '../types'

export function renderLabel(component: YawcComponent): VNode {
  const caption = component.Properties?.Caption || ''
  
  console.error('ID', component);
  return h('div', {
    attrs: {id: component.ID},
    style: {
      display: 'block',
      margin: '5px 0',
      ...component.Properties?.Style
    }
  }, caption)
}