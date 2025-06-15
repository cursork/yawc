# Component Implementation Guide

This guide documents the proven workflow for implementing yawc components based on lessons learned from the Edit component implementation.

## Overview

Implementing components using inspiration from legacy systems eliminates guesswork and ensures compatibility. The process involves analyzing existing implementations, designing clean architectures, and creating comprehensive tests.

## Workflow

### 1. Gather Inspiration Materials

Create an `inspiration/{ComponentName}/` directory with:

- **APL/** - Original APL demos and definitions
  - `demos/` - Working APL code that creates the component
  - `definition/` - PropList.apla, SupportedEvents.apla, etc.
- **LegacyJS/** - Current React implementation
- **HTML/** - Rendered HTML output from browser console

**Example structure:**
```
inspiration/Edit/
├── APL/demos/DemoCookies.aplf
├── APL/definition/PropList.apla
├── LegacyJS/index.jsx  
└── html/DemoEdit.html
```

### 2. Analyze Requirements

From inspiration materials, identify:

- **Properties**: Text, Value, FieldType, MaxLength, etc.
- **Events**: Change, KeyPress, GotFocus, LostFocus, etc.
- **Variants**: Different behaviors based on properties (FieldType, Style, etc.)
- **HTML structure**: Input type, styling, attributes

### 3. Design Architecture

**Simple components**: Single file in `src/components/{Name}.ts`

**Complex components**: Directory structure when variants exist:
```
src/components/Edit/
├── index.ts      # Dispatcher based on properties
├── Char.ts       # Specialized implementation
└── Numeric.ts    # Specialized implementation
```

**Key principle**: Avoid scattered conditionals by creating focused implementations.

### 4. Implementation Pattern

#### Main Component (or Dispatcher)

```typescript
export const ComponentName = {
  mergeDefaults(properties: ComponentProperties): ComponentProperties {
    const defaults = {
      Property1: 'defaultValue',
      Property2: 0
    }
    return { ...defaults, ...properties }
  },

  render(component: ComponentInstance) {
    // For simple components: implement rendering
    // For complex components: delegate to specialists
    
    const variant = component.Properties?.VariantProperty
    if (variant === 'Type1') {
      return SpecializedComponent1.render(component)
    }
    return SpecializedComponent2.render(component)
  }
}
```

#### Specialized Components

```typescript
export const SpecializedComponent = {
  render(component: ComponentInstance): VNode {
    const props = component.Properties!
    
    // Determine primary data source
    const value = props.PrimaryProperty || fallback
    
    // Build styles
    const style: Record<string, string> = {
      position: 'absolute',
      // ... component-specific styles
    }
    
    // Position and size
    if (props.Posn) {
      style.top = String(props.Posn[0]) + 'px'
      style.left = String(props.Posn[1]) + 'px'
    }
    
    // Build attributes
    const attrs: Record<string, any> = {
      id: component.ID,
      // ... component-specific attributes
    }
    
    // Conditional attributes
    if (props.ConditionalProperty) {
      attrs.conditionalAttr = true
    }
    
    return h('elementType', {
      attrs,
      style,
      on: {
        eventName: (event: Event) => {
          // Update state
          yawc.T.mergeProps(component.ID, { Property: newValue })
          // Send events
          sendEvent(component, 'EventName')
        }
      }
    })
  }
}
```

### 5. Register Component

Add to `src/yawc.ts`:

```typescript
import { ComponentName } from './components/ComponentName'

const componentRegistry: ComponentRegistry = {
  // ... existing components
  ComponentName,
}
```

### 6. Create Test Cases

#### Test Structure
```
tests/cases/component-variant/
├── messages.txt    # Test protocol
└── expected.html   # Expected rendering
```

#### Test Protocol Format

```
T: {"WC": {"ID": "F1", "Properties": {"Type": "Form"}}}
T: {"WC": {"ID": "F1.C1", "Properties": {"Type": "ComponentName", "Posn": [50, 10], "Property": "value"}}}
T: {"WS": {"ID": "F1.C1", "Properties": {"Property": "updated value"}}}
U: {"Action": "userAction", "ID": "F1.C1", "Value": "new value"}
R: {"Event": {"EventName": "EventType", "ID": "F1.C1"}}
T: {"WG": {"ID": "F1.C1", "Properties": ["Property"]}}
R: {"WG": {"ID": "F1.C1", "Properties": {"Property": "expected value"}}}
```

#### Test Action Support

If new user actions are needed, add to:

**tests/browser.js:**
```typescript
async actionName(elementId, value) {
  await this.page.evaluate(({ id, val }) => {
    const element = document.getElementById(id)
    if (element) {
      // Simulate user interaction
      element.dispatchEvent(new Event('eventType', { bubbles: true }))
    }
  }, { id: elementId, val: value })
}
```

**tests/runner.js:**
```typescript
case 'actionName':
  await this.browser.actionName(ID, Value)
  break
```

### 7. Property Management

#### Source of Truth Patterns

**Text-focused components** (FieldType: 'Char'):
- Text is primary, Value is derived (forced to character)
- Update both on input: `{ Text: newText, Value: newText }`

**Numeric components** (FieldType: 'Numeric', 'LongNumeric'):
- Value is primary, Text is derived (formatted display)  
- Update both on input: `{ Value: numericValue, Text: displayText }`

**State components** (Buttons, Checkboxes):
- State is primary
- Update on interaction: `{ State: newState }`

#### Property Validation

Follow APL documentation patterns:
- `null` and `undefined` → return `[]` for APL compatibility
- Missing properties → return property name and `[]` 
- Type conversion as per FieldType specifications

### 8. Event Handling

#### Standard Events
- **Change**: Value/content modification
- **Select**: Button clicks, item selection  
- **GotFocus/LostFocus**: Focus management
- **KeyPress**: Keyboard input with modifier keys

#### Event Data Format
```typescript
sendEvent(component, 'KeyPress', {
  key: event.key,
  keyCode: event.keyCode,
  shiftKey: event.shiftKey,
  ctrlKey: event.ctrlKey,
  altKey: event.altKey
})
```

### 9. Testing and Validation

1. **Build**: `npm run build` (check TypeScript errors)
2. **Test**: `node tests/runner.js component-test-name`
3. **Visual**: Compare actual vs expected HTML
4. **Protocol**: Verify WG responses and event handling
5. **Integration**: Test with dev server `npm run dev`

## Architecture Decisions

### Why Directory Structure for Complex Components?

- **Eliminates scattered conditionals**: Each specialist focuses on one behavior
- **Clear separation of concerns**: Text vs Numeric vs Date handling
- **Maintainable**: Easy to add new variants without affecting existing code
- **Testable**: Each variant can be tested independently

### Why Source of Truth Patterns?

- **Reduces bugs**: Clear primary property eliminates sync issues
- **APL compatibility**: Matches expected WG response patterns
- **Predictable behavior**: Developers know which property to trust

### Why Inspiration-Driven Development?

- **Eliminates guesswork**: Real examples show exact requirements
- **Ensures compatibility**: Matches existing system behavior
- **Faster implementation**: Clear specification from working code
- **Better testing**: Known expected outputs from real usage

## Next Steps

With this pattern established, the remaining 42 components can be implemented systematically:

1. Gather inspiration materials for target component
2. Identify variants and architectural needs
3. Implement using proven patterns
4. Create comprehensive test coverage
5. Validate against APL system behavior

This approach scales to handle the full component library needed for feature parity.