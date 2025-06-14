import { init, h, classModule, propsModule, styleModule, eventListenersModule, attributesModule } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { Renderer, ComponentInstance } from './types'

export class SnabbdomRenderer implements Renderer {
  private patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    attributesModule,
  ])
  
  private vnode: VNode | Element = document.getElementById('app')!

  render(id?: string): void {
    const yawc = (window as any).yawc
    if (!yawc) return
    
    if (id) {
      // Partial re-render of specific component
      const component = yawc.T.find(id)
      if (component) {
        this.renderPartial(component)
      }
    } else {
      // Full re-render
      this.renderFull()
    }
  }

  private renderFull(): void {
    const yawc = (window as any).yawc
    if (!yawc) return
    
    const formComponent = Object.values(yawc.T.Roots).find((root: any) => root.Properties.Type === 'Form')
    
    if (formComponent) {
      const formVNode = this.renderComponent(formComponent as ComponentInstance)
      const appVNode = h('div', { attrs: { id: 'app' } }, [formVNode])
      this.vnode = this.patch(this.vnode, appVNode)
      
      this.updateDOMProperties()
    } else {
      const emptyVNode = h('div', { attrs: { id: 'app' } }, 'No Form component found')
      this.vnode = this.patch(this.vnode, emptyVNode)
    }
  }

  private renderPartial(component: ComponentInstance): void {
    const newVNode = this.renderComponent(component)
    const element = document.getElementById(component.ID)
    if (element) {
      this.patch(element, newVNode)
    }
  }

  renderComponent(component: ComponentInstance): VNode {
    const yawc = (window as any).yawc
    if (!yawc) {
      return h('div', { attrs: { id: component.ID } }, 'yawc not initialized')
    }
    
    const componentType = component.Properties.Type
    const componentHandler = yawc.C[componentType]
    
    if (!componentHandler) {
      // Unknown component type - render as div with error
      return h('div', { 
        attrs: { id: component.ID },
        style: { 
          border: '1px solid red', 
          padding: '10px', 
          color: 'red' 
        } 
      }, `Unknown component type: ${componentType}`)
    }

    return componentHandler.render(component)
  }

  private updateDOMProperties(): void {
    const yawc = (window as any).yawc
    if (!yawc) return
    
    const components = yawc.T.getComponents()
    components.forEach((component: ComponentInstance) => {
      const element = document.getElementById(component.ID)
      if (element) {
        const rect = element.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(element)
        
        if (!component.Properties.Size) {
          yawc.T.mergeProps(component.ID, { Size: [rect.height, rect.width] })
        }
        
        if (!component.Properties.Posn && computedStyle.position === 'absolute') {
          yawc.T.mergeProps(component.ID, { Posn: [rect.top, rect.left] })
        }
      }
    })
  }
}