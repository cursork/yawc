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