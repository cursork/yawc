# ADR 00002: Component Specialization Architecture for Complex Components

## Status
Accepted

## Context

The Edit component presented a complex architectural challenge due to the Text/Value duality and different behaviors based on FieldType. The original EWC system and legacy React implementation both contained scattered conditional logic that made the code difficult to maintain and understand.

Key complexity factors identified:
- **Text vs Value**: Char fields use Text as source of truth, Numeric fields use Value
- **FieldType variations**: Different input types, validation, and formatting requirements
- **Grid context**: Edit components behave differently when embedded in spreadsheet-like grids
- **APL compatibility**: Both Text and Value must be available for WG (Get Property) responses

The traditional approach would be a single Edit component with extensive if/else branching based on FieldType, leading to:
- Complex, hard-to-follow render logic
- Difficult testing (need to test all combinations)
- Error-prone property synchronization
- Scattered conditional logic throughout the codebase

## Decision

Implement a **Component Specialization Architecture** where complex components are split into:

1. **Main Component (Dispatcher)**: `Edit/index.ts`
   - Handles `mergeDefaults()` for common properties
   - Dispatches to appropriate specialist based on FieldType
   - Maintains the single "Edit" interface expected by APL

2. **Specialized Components**: `Edit/Char.ts`, `Edit/Numeric.ts`
   - Each focuses on a single FieldType category
   - Clear source of truth (Text for Char, Value for Numeric)
   - No cross-concerns or conditional branching

3. **Directory Structure**: Components with variants get their own directory
   ```
   src/components/Edit/
   ├── index.ts      # Dispatcher
   ├── Char.ts       # Text-focused implementation  
   └── Numeric.ts    # Value-focused implementation
   ```

## Consequences

### Benefits
- **Clean separation**: Each specialist handles one concern without conditionals
- **Clear data flow**: Explicit source of truth for each variant eliminates sync bugs
- **Maintainable**: Easy to add new FieldTypes without affecting existing code
- **Testable**: Each variant can be tested independently with focused test cases
- **Scalable**: Pattern works for other complex components (43 total needed)
- **APL compatible**: Maintains single "Edit" interface while handling complexity internally

### Trade-offs
- **More files**: Directory structure vs single file increases file count
- **Indirection**: Extra dispatch step adds minor complexity
- **Code duplication**: Some shared patterns repeated across specialists

### Risks Mitigated
- **Conditional complexity**: Eliminated scattered if/else logic
- **Property sync bugs**: Clear source of truth prevents Text/Value inconsistencies  
- **Testing complexity**: Focused components easier to test than monolithic conditional logic
- **Future maintenance**: New developers can understand specialists without learning entire component

## Implementation Notes

**Dispatcher Pattern:**
```typescript
render(component: ComponentInstance) {
  const fieldType = component.Properties?.FieldType || 'Char'
  
  if (fieldType === 'Numeric' || fieldType === 'LongNumeric' || ...) {
    return EditNumeric.render(component)
  }
  
  return EditChar.render(component)  // Default to Char
}
```

**Source of Truth Pattern:**
- **Char**: Text primary, Value = Text (forced to character)
- **Numeric**: Value primary, Text = formatted Value

**Testing Pattern:**
- Separate test cases for each variant: `edit-char/`, `edit-numeric/`
- Each tests the specific behavior without cross-contamination

## Alternatives Considered

1. **Single Edit Component with Conditionals**
   - **Rejected**: Led to scattered if/else logic, hard to maintain
   - **Problem**: Testing required all FieldType combinations

2. **Property-based Configuration Objects**
   - **Rejected**: Still required conditionals, just moved the complexity
   - **Problem**: Unclear source of truth for Text/Value synchronization

3. **Inheritance/Class Hierarchy**
   - **Rejected**: Not idiomatic in TypeScript functional component pattern
   - **Problem**: Doesn't fit well with snabbdom VNode rendering

## Decision Criteria Met

✅ **Maintainability**: Each specialist is focused and understandable  
✅ **Testability**: Independent test coverage for each variant  
✅ **Scalability**: Pattern applies to other complex components  
✅ **Compatibility**: Maintains APL interface expectations  
✅ **Performance**: No significant overhead from dispatch  

## Validation

The Edit component implementation successfully:
- ✅ Passes all test cases (6 passed, 0 failed)
- ✅ Handles Text/Value synchronization correctly
- ✅ Supports both Char and Numeric FieldTypes
- ✅ Maintains clean, readable code without conditionals
- ✅ Provides foundation for remaining 42 components

