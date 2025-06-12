import { init, h, classModule, propsModule, styleModule, eventListenersModule } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { Renderer, YawcComponent } from './types'
import { yawc } from './yawc'

// Component renderers
import { renderForm } from './components/Form'
import { renderSubForm } from './components/SubForm'  
import { renderLabel } from './components/Label'

export class SnabbdomRenderer implements Renderer {
  private patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
  ])
  
  private vnode: VNode | Element = document.getElementById('app')!
  private componentRenderers: Record<string, (component: YawcComponent) => VNode> = {
    'Form': renderForm,
    'SubForm': renderSubForm,
    'Label': renderLabel
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
    // Find the Form component among roots
    const formComponent = Object.values(yawc.T.Roots).find(root => root.Type === 'Form')
    
    if (formComponent) {
      const formVNode = this.renderComponent(formComponent)
      this.vnode = this.patch(this.vnode, formVNode)
    } else {
      // No Form found - render empty div
      const emptyVNode = h('div', { attrs: { id: 'app' } }, 'No Form component found')
      this.vnode = this.patch(this.vnode, emptyVNode)
    }
  }

  private renderPartial(component: YawcComponent): void {
    // For now, do a full re-render
    // TODO: Implement efficient partial updates
    this.renderFull()
  }

  private renderComponent(component: YawcComponent): VNode {
    const renderer = this.componentRenderers[component.Type]
    
    if (!renderer) {
      // Unknown component type - render as div with error
      return h('div', { 
        style: { 
          border: '1px solid red', 
          padding: '10px', 
          color: 'red' 
        } 
      }, `Unknown component type: ${component.Type}`)
    }

    return renderer(component)
  }

  // Register custom component renderer
  registerComponent(type: string, renderer: (component: YawcComponent) => VNode): void {
    this.componentRenderers[type] = renderer
  }
}