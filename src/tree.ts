import type { YawcTree, ComponentInstance, ComponentProperties } from './types'

export class Tree implements YawcTree {
  Roots: Record<string, ComponentInstance> = {}

  // Extract parent ID from component ID (everything before last '.')
  private getParentId(id: string): string | null {
    const lastDot = id.lastIndexOf('.')
    return lastDot > 0 ? id.substring(0, lastDot) : null
  }

  // WC - Create component
  create(id: string, properties: ComponentProperties): void {
    // Apply component defaults
    const yawc = (globalThis as any).yawc || (window as any).yawc
    const componentHandler = yawc?.C?.[properties.Type]
    const mergedProperties = componentHandler?.mergeDefaults 
      ? componentHandler.mergeDefaults(properties)
      : properties
    
    const component: ComponentInstance = {
      ID: id,
      Children: {},
      Properties: mergedProperties
    }

    const parentId = this.getParentId(id)
    
    if (parentId) {
      const parent = this.find(parentId)
      if (parent && parent.Children) {
        parent.Children[id] = component
      }
    } else {
      // Root component (no dots in ID)
      this.Roots[id] = component
    }
  }

  // WS - Set properties
  mergeProps(id: string, properties: Record<string, any>): void {
    const component = this.find(id)
    if (component && component.Properties) {
      component.Properties = { ...component.Properties, ...properties }
    }
  }

  // EX - Expunge/destroy component
  destroy(id: string): void {
    // Remove from roots if it's a root component
    if (this.Roots[id]) {
      delete this.Roots[id]
      return
    }

    // Find and remove from parent's children
    this.walkTree((component, parentComponent, key) => {
      if (component.ID === id && parentComponent && parentComponent.Children && key) {
        delete parentComponent.Children[key]
        return true // Stop walking
      }
      return false
    })
  }

  // Find component by ID
  find(id: string): ComponentInstance | undefined {
    if (this.Roots[id]) {
      return this.Roots[id]
    }

    let found: ComponentInstance | undefined
    this.walkTree((component) => {
      if (component.ID === id) {
        found = component
        return true // Stop walking
      }
      return false
    })
    
    return found
  }

  // Walk the entire tree
  private walkTree(
    callback: (
      component: ComponentInstance, 
      parent?: ComponentInstance, 
      key?: string
    ) => boolean
  ): void {
    const walk = (component: ComponentInstance, parent?: ComponentInstance, key?: string): boolean => {
      if (callback(component, parent, key)) {
        return true // Stop walking
      }

      if (component.Children) {
        for (const [childKey, child] of Object.entries(component.Children)) {
          if (walk(child, component, childKey)) {
            return true
          }
        }
      }
      return false
    }

    for (const [key, root] of Object.entries(this.Roots)) {
      if (walk(root, undefined, key)) {
        break
      }
    }
  }

  // Get all components in rendering order
  getComponents(): ComponentInstance[] {
    const components: ComponentInstance[] = []
    this.walkTree((component) => {
      components.push(component)
      return false // Continue walking
    })
    return components
  }
}