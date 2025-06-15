import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { ComponentInstance } from '../../types'
import { yawc } from '../../yawc'
import { sendEvent } from '../../events'

export const EditNumeric = {
  render(component: ComponentInstance): VNode {
    const props = component.Properties!
    
    // Value is source of truth for Numeric fields
    const numericValue = props.Value || 0
    const displayText = String(numericValue)
    
    const style: Record<string, string> = {
      position: 'absolute',
      border: 'none',
      borderBottom: '1px solid black',
      paddingLeft: '5px',
      fontSize: '12px',
      textAlign: 'right',
      display: props.Visible ? 'block' : 'none'
    }
    
    if (props.Posn) {
      style.top = String(props.Posn[0]) + 'px'
      style.left = String(props.Posn[1]) + 'px'
    }
    
    if (props.Size) {
      style.height = String(props.Size[0]) + 'px'
      style.width = String(props.Size[1]) + 'px'
    }
    
    if (!props.Active) {
      style.backgroundColor = 'field'
      style.color = '#838383'
    }
    
    const attrs: Record<string, any> = {
      id: component.ID,
      type: 'number',
      value: displayText,
      disabled: !props.Active
    }
    
    if (props.ReadOnly) {
      attrs.readonly = true
    }
    
    return h('input', {
      attrs,
      style,
      on: {
        input: (event: Event) => {
          const target = event.target as HTMLInputElement
          const newValue = parseFloat(target.value) || 0
          const newText = target.value
          
          // Value is primary, Text is derived display
          yawc.T.mergeProps(component.ID, {
            Value: newValue,
            Text: newText
          })
        },
        
        change: () => {
          sendEvent(component, 'Change')
        },
        
        keydown: (event: KeyboardEvent) => {
          sendEvent(component, 'KeyPress', {
            key: event.key,
            keyCode: event.keyCode,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey
          })
        },
        
        focus: () => {
          sendEvent(component, 'GotFocus')
        },
        
        blur: () => {
          sendEvent(component, 'LostFocus')
        }
      }
    })
  }
}