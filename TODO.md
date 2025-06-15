# Current TODO Items

## Component Development

- Add more component types (Input, Textarea, Select, etc.)
- Implement more event types beyond Select (KeyPress, Change, etc.)
- Add visual regression testing for more complex layouts
- null and undefined should always be returned as [] - this gets translated to 'nothing' on the APL side
  - WG on missing Properties should return the property name and [] - we may want to toggle this though, based on whether we want to see the error on the APL or JS side

## Current Session Priority Items

- Make DemoCookie demo fully functional
- Discuss global handlers/common approaches for events like click (43 components total needed for feature parity with existing system)  
- WX messages - we use that for EvalJS

## System Improvements

- Remove the 2000ms delay workaround in test runner after fixing timing issues - is an intermediate option to run tests reducing it slowly to find a better N milliseconds?
- Optimize DOM property synchronization for Size/Posn
- Implement efficient partial rendering instead of full re-renders

## Test Infrastructure

- Add more visual test cases for different component combinations
- Create test cases for WG (Get property) message handling
- Add tests for component destruction and cleanup

## Completed Items

### 2025-06-15
- ✅ Implemented Edit component with FieldType-based specialization architecture
- ✅ Created Edit/Char.ts (Text-focused) and Edit/Numeric.ts (Value-focused) variants
- ✅ Established inspiration-driven component development workflow
- ✅ Added comprehensive test coverage for Edit component (both Char and Numeric)
- ✅ Added input action support to test framework
- ✅ Created COMPONENT-GUIDE.md with systematic implementation patterns
- ✅ Documented Component Specialization Architecture in ADR 00002

### 2025-06-14
- ✅ Implemented Combo Select event functionality with SelItems bitmask support
- ✅ Created unified component registry architecture (yawc.C)
- ✅ Refactored all components to object pattern with mergeDefaults() and render()
- ✅ Updated naming: ComponentHandler → Component, YawcComponent → ComponentInstance
- ✅ Removed deprecated registerComponent from Renderer interface
- ✅ Added comprehensive test coverage for Combo Select events
- ✅ Verified SelItems pattern works with WC→tree→WG flow
