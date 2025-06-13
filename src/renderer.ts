import { init, h, classModule, propsModule, styleModule, eventListenersModule, attributesModule } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { Renderer, YawcComponent } from './types'
import { yawc } from './yawc'

// Component renderers
import { renderForm } from './components/Form'
import { renderSubForm } from './components/SubForm'  
import { renderLabel } from './components/Label'
import { renderButton } from './components/Button'
import { renderCombo } from './components/Combo'

export class SnabbdomRenderer implements Renderer {
  private patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    attributesModule,
  ])
  
  private vnode: VNode | Element = document.getElementById('app')!
  private componentRenderers: Record<string, (component: YawcComponent) => VNode> = {
    'Form': renderForm,
    'SubForm': renderSubForm,
    'Label': renderLabel,
    'Button': renderButton,
    'Combo': renderCombo
  }

  render(id?: string): void {
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
    const formComponent = Object.values(yawc.T.Roots).find(root => root.Properties.Type === 'Form')
    
    if (formComponent) {
      const formVNode = this.renderComponent(formComponent)
      const appVNode = h('div', { attrs: { id: 'app' } }, [formVNode])
      this.vnode = this.patch(this.vnode, appVNode)
      
      this.updateDOMProperties()
    } else {
      const emptyVNode = h('div', { attrs: { id: 'app' } }, 'No Form component found')
      this.vnode = this.patch(this.vnode, emptyVNode)
    }
  }

  private renderPartial(component: YawcComponent): void {
    const newVNode = this.renderComponent(component)
    const element = document.getElementById(component.ID)
    if (element) {
      this.patch(element, newVNode)
    }
  }

  private renderComponent(component: YawcComponent): VNode {
    const componentType = component.Properties.Type
    const renderer = this.componentRenderers[componentType]
    
    if (!renderer) {
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

    return renderer(component)
  }

  // Register custom component renderer
  registerComponent(type: string, renderer: (component: YawcComponent) => VNode): void {
    this.componentRenderers[type] = renderer
  }

  private updateDOMProperties(): void {
    const components = yawc.T.getComponents()
    components.forEach(component => {
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