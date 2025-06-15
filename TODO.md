# Current TODO Items

## Component Development

- Add more component types (Input, Textarea, Select, etc.)
- Implement more event types beyond Select (KeyPress, Change, etc.)
- Add visual regression testing for more complex layouts

## Current Session Priority Items

- Experiment with sharing code from legacy system to help building new components
- Implement Edit component (HTML input) - requires architectural decision on whether to split it up on JS side or keep unified
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

### 2025-06-14
- ✅ Implemented Combo Select event functionality with SelItems bitmask support
- ✅ Created unified component registry architecture (yawc.C)
- ✅ Refactored all components to object pattern with mergeDefaults() and render()
- ✅ Updated naming: ComponentHandler → Component, YawcComponent → ComponentInstance
- ✅ Removed deprecated registerComponent from Renderer interface
- ✅ Added comprehensive test coverage for Combo Select events
- ✅ Verified SelItems pattern works with WC→tree→WG flow
