import { h } from 'snabbdom'
import type { VNode } from 'snabbdom'
import type { ComponentInstance } from '../../types'
import { yawc } from '../../yawc'
import { sendEvent } from '../../events'

export const EditChar = {
  render(component: ComponentInstance): VNode {
    const props = component.Properties!
    
    // Text is source of truth for Char fields
    const inputValue = String(props.Text || '')
    
    const style: Record<string, string> = {
      position: 'absolute',
      border: 'none',
      borderBottom: '1px solid black',
      paddingLeft: '5px',
      fontSize: '12px',
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
      type: props.Password ? 'password' : 'text',
      value: inputValue,
      disabled: !props.Active
    }
    
    if (props.ReadOnly) {
      attrs.readonly = true
    }
    
    if (props.MaxLength > 0) {
      attrs.maxlength = props.MaxLength
    }
    
    return h('input', {
      attrs,
      style,
      on: {
        input: (event: Event) => {
          const target = event.target as HTMLInputElement
          const newText = target.value
          
          // Text is primary, Value is forced to character vector (same as Text)
          yawc.T.mergeProps(component.ID, {
            Text: newText,
            Value: newText
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