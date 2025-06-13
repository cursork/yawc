import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { YawcComponent } from '../types'

export function renderLabel(component: YawcComponent): VNode {
  const caption = component.Properties?.Caption || ''
  
  // Build style object
  const style: any = {
    display: 'block',
    position: 'absolute'
  }
  
  // Add position from Posn property
  if (component.Properties?.Posn) {
    const [top, left] = component.Properties.Posn
    style.top = `${top}px`
    style.left = `${left}px`
  }
  
  // Add size from Size property
  if (component.Properties?.Size) {
    const [height, width] = component.Properties.Size
    style.height = `${height}px`
    style.width = `${width}px`
  }
  
  // Merge any custom styles
  Object.assign(style, component.Properties?.Style)
  
  return h('div', {
    attrs: {id: component.ID},
    style
  }, caption)
}