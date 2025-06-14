# Current TODO Items

## Component Development

- Add more component types (Input, Textarea, Select, etc.)
- Implement more event types beyond Select (KeyPress, Change, etc.)
- Add visual regression testing for more complex layouts

## System Improvements

- Remove the 2000ms delay workaround in test runner after fixing timing issues
- Optimize DOM property synchronization for Size/Posn
- Implement efficient partial rendering instead of full re-renders

## Test Infrastructure

- Add more visual test cases for different component combinations
- Create test cases for WG (Get property) message handling
- Add tests for component destruction and cleanup

## Completed Items

### 2025-06-14
- ✅ Implemented Combo Select event functionality with SelItems bitmask support
- ✅ Created unified component registry architecture (yawc.C)
- ✅ Refactored all components to object pattern with mergeDefaults() and render()
- ✅ Updated naming: ComponentHandler → Component, YawcComponent → ComponentInstance
- ✅ Removed deprecated registerComponent from Renderer interface
- ✅ Added comprehensive test coverage for Combo Select events
- ✅ Verified SelItems pattern works with WC→tree→WG flow