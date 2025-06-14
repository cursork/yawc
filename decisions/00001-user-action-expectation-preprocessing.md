# ADR-00001: Pre-process Response Expectations for User Actions

## Status
Accepted

## Context
The test framework processes test messages sequentially (T:, U:, R: etc.) but there was a timing issue where user actions (U:) would trigger immediate responses that arrived before their corresponding expectations (R:) were set.

## Issue Found
In the button-events test case:
```
T: {"WC":{"ID":"F1","Properties":{"Type":"Form","Size":[200,300]}}}
T: {"WC":{"ID":"F1.B1","Properties":{"Type":"Button","Caption":"Click Me","Event":[["Select",""]],"Posn":[20,20],"Size":[30,80]}}}
U: {"Action":"click","ID":"F1.B1"}
R: {"Event":{"EventName":"Select","ID":"F1.B1"}}
```

The sequence was:
1. Process T: lines (create components)
2. Process U: line (simulate click) → Event message sent immediately
3. Process R: line (set expectation) → Too late, message already arrived

This caused Event messages to be marked as "unexpected" even though they were correct.

## Decision
Implemented expectation pre-processing: when a U: line is followed by an R: line, set the R: expectation immediately before executing the U: action, then skip the R: line during normal processing to avoid duplicates.

## Implementation
```javascript
// In processMessages()
if (trimmed.startsWith('U: ')) {
  // Check if next line is R: and set expectation first
  if (i + 1 < lines.length && lines[i + 1].trim().startsWith('R: ')) {
    const nextJson = lines[i + 1].trim().substring(3)
    this.mockServer.expectMessage(JSON.parse(nextJson))
  }
  await this.simulateUserAction(action)
} else if (trimmed.startsWith('R: ')) {
  // Skip R: if previous line was U: (already pre-processed)
  if (i > 0 && lines[i - 1].trim().startsWith('U: ')) {
    continue
  }
  this.mockServer.expectMessage(JSON.parse(json))
}
```

## Consequences

### Positive
- ✅ All tests now pass (3 passed, 0 failed)
- ✅ Event system works correctly for button clicks
- ✅ No more "unmet expectations" errors
- ✅ Maintains the intended test sequence semantics

### Concerns
1. **Tight coupling**: Logic assumes U: lines are immediately followed by R: lines
2. **Fragility**: Adding blank lines or comments between U: and R: would break this
3. **Hidden behavior**: The pre-processing is not obvious from reading the test files
4. **Limited scope**: Only handles the U:→R: pattern, may not scale to more complex scenarios
5. **Order dependency**: Relies on specific line ordering rather than explicit timing control

## Alternatives Considered
1. **Sequential processing**: Process all T: and R: first, then U: - rejected because it changes test semantics
2. **Explicit timing**: Add delay between U: and R: - rejected as it masks the real issue
3. **Event queuing**: Buffer responses until expectations are set - more complex but might be cleaner

## Future Considerations
This solution may need revision if:
- Tests require more complex interaction patterns
- Multiple R: expectations follow a single U: action  
- Non-adjacent U:/R: pairs are needed
- Performance becomes an issue with the lookahead logic

The current solution works for the immediate need but should be monitored for robustness as the test suite grows.