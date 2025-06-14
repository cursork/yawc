# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

yawc (Yet Another Web Client) is a JavaScript client for EWC (https://github.com/Dyalog/ewc), which emulates ⎕WC from Dyalog APL for building web applications. This is a cleaner redesign based on lessons learned from the existing ewc-client implementation.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - TypeScript compilation followed by Vite build
- `npm run preview` - Preview the production build

## Architecture

The application follows a global state architecture with four main components:

### Core Structure
- **yawc.T (Tree)**: Global state tree containing all application components and properties
- **yawc.R (Renderer)**: Pluggable renderer (currently snabbdom-based for DOM)
- **yawc.W (WebSocket)**: Handles EWC server communication (WC/WS/WG/EX/NQ messages)
- **yawc.Q (Queues)**: Message queuing system for handling async server interactions

### Implementation Details

**Tree (src/tree.ts)**: Component hierarchy using dot notation for parent-child relationships (e.g., 'F1.SF' has parent 'F1'). Provides create(), setProperty(), getProperty(), destroy(), and find() methods.

**Renderer (src/renderer.ts)**: Snabbdom-based rendering that finds the Form component among roots and renders it. Component-specific renderers in src/components/ directory.

**WebSocket (src/websocket.ts)**: Message handlers organized by type (onWC, onWS, onWG, onEX, onNQ). Messages are single key-value pairs like `{"WC": {...}}`.

**Queue (src/queue.ts)**: Sequential processing of messages with optional callbacks. NQ messages require server response before continuing.

### State Management
All state lives in a single global `yawc` variable (window.yawc in browser). The Tree structure represents Forms, SubForms, and components hierarchically with IDs, Types, Children, and Properties.

### EWC Protocol
The client communicates with an APL server via WebSocket using EWC messages:
- WC: Create component
- WS: Set property
- WG: Get property  
- EX: Destroy component
- NQ: Enqueue message

Key complexity: Some operations require server confirmation before UI updates (like KeyPress events), requiring careful message queuing and state management.

## Technology Stack

- TypeScript with strict mode
- Vite for bundling and dev server
- Snabbdom for virtual DOM rendering
- Native WebSocket for server communication

## Code Style Preferences

- Avoid extraneous comments in code
- Prefer terse function and variable names
- Keep code concise and readable without verbose naming
- Every component must include its ID in the rendered element using `attrs: { id: component.ID }`

## Decision Making and Documentation

When facing tricky technical issues or implementation choices, create a decision record in the `decisions/` folder using the format `decisions/NNNNN-descriptive-title.md`. These ADRs (Architecture Decision Records) should document:

1. **Context**: The problem or choice being made
2. **Decision**: What was chosen and why
3. **Consequences**: Trade-offs, benefits, and concerns
4. **Alternatives Considered**: Other options that were rejected

Examples of decision-worthy issues:
- Complex workarounds or fixes with trade-offs
- Architecture choices with multiple valid approaches
- Performance optimizations with readability concerns
- Test framework design decisions

Use `TODO.md` only for current, actionable tasks. Move completed items to decision records if they involved significant design choices.

## Workflow Rules

- If user says just 'wip' in a message, run `git add .` and `git commit -m "wip"`