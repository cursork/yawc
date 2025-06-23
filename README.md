# yawc (Yet Another WC)

I pronounce it like York, but without any rhoticity.

The goal was to approach an implementation of EWC that I thought was a cleaner
model and to try to verify that. I had been thinking about the 'what if's for
months (even had a small prototype myself), and decided to play.

This was an experiment in guided Claude Code usage - everything was reviewed to
some extent (depending on my state of alertness).

I started with a DESIGN.md, and then we needed very little correction from
there.

## Structure

### CLAUDE.md

I'd recommend reading this - it covers a lot of what was decided about process.

### chats

Not much in here - I used a 'save chat' and a 'status' command to be able to
reload a decent context when I was running low and Claude was going to reset.

Nice hack though, to stop it having amnesia. (See CLAUDE.md for what they do)

### decisions

Records of all decisions made that might affect things in the future.

There was a change to tests that was not quite what I wanted, but I decided to
go with Claude's partial solution than design something better. I wanted to
record that, so I could give Claude context when revisiting. I suggested a list
of decisions, and it went with ADRs as the model. I've used those in the past,
so was happy.

### tests

#### cases

All define a set of transmitted messages (T:), expected responses (R:) and any
user actions (U:) as a timeline. The result of applying all of them is then
checked against the `expected.html`.

#### otherwise

`integration` was a simple test to check against a running demo.

`visual` is a precursor to further experiments in doing visual diffs - explored
in ewc-client-demo-test repo.

### inspiration

I decided to experiment with giving the relevant APL from ewc, a demo, the old
JS and the rendered HTML to Claude, to see if it could derive a new component
from that.

This was surprisingly successful, but remains WIP - it's only been used for one
very narrow usecase.

### Various .md files

* TODO.md - maintaining a TODO list across sessions
* timesheet.md - manual recording, but Claude includes it when I ask for status
* COMPONENT-GUIDE.md - how to implement a component, and to be honest, this is
  as good as anything I've ever got from a human, when asked for the same
