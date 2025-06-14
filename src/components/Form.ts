import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { ComponentInstance, ComponentProperties } from '../types'
import { yawc } from '../yawc'

export const Form = {
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

    // Build style object
    const style: any = {
      fontSize: '12px',
      position: 'relative',
      border: '1px solid rgb(240, 240, 240)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }

    // Add background color from BCol property
    if (component.Properties?.BCol) {
      const [r, g, b] = component.Properties.BCol
      style.background = `rgb(${r}, ${g}, ${b})`
    }

    // Add background image if Picture property exists
    if (component.Properties?.Picture) {
      const pictureRef = component.Properties.Picture[0] // BitMap ID
      const bitMap = yawc.T.find(pictureRef)
      if (bitMap && bitMap.Properties?.File) {
        const baseUrl = 'http://localhost:22322' // Should be configurable
        const imageUrl = `${baseUrl}${bitMap.Properties.File}`
        style.background = `url("${imageUrl}") center center no-repeat` + 
                          (style.background ? ` ${style.background}` : '')
      }
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
      attrs: { id: component.ID },
      style
    }, children)
  }
}

function renderChild(component: ComponentInstance): VNode {
  return (yawc.R as any).renderComponent(component)
}