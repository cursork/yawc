import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { YawcComponent } from '../types'

export function renderCombo(component: YawcComponent): VNode {
  const items = component.Properties?.Items || []
  const text = component.Properties?.Text || ''
  
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
    h('option', { attrs: { value: item } }, item)
  )
  
  return h('select', {
    attrs: { id: component.ID },
    style
  }, options)
}