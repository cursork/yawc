import type { ComponentInstance, ComponentProperties } from '../../types'
import { EditChar } from './Char'
import { EditNumeric } from './Numeric'

export const Edit = {
  mergeDefaults(properties: ComponentProperties): ComponentProperties {
    const defaults = {
      Text: '',
      Value: '',
      FieldType: 'Char',
      MaxLength: 0,
      Password: 0,
      Active: 1,
      Visible: 1,
      ReadOnly: 0
    }
    
    return { ...defaults, ...properties }
  },

  render(component: ComponentInstance) {
    const fieldType = component.Properties?.FieldType || 'Char'
    
    // Delegate to appropriate specialized component
    if (fieldType === 'Numeric' || fieldType === 'LongNumeric' || 
        fieldType === 'Currency' || fieldType === 'Date' || 
        fieldType === 'LongDate' || fieldType === 'Time') {
      return EditNumeric.render(component)
    }
    
    // Default to Char for all other cases
    return EditChar.render(component)
  }
}