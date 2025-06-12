import { init, h, classModule, propsModule, styleModule, eventListenersModule } from 'snabbdom'
import type { VNode } from 'snabbdom'

// Initialize snabbdom with modules
const patch = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
])

// Global application state
interface AppState {
  count: number
  message: string
}

let state: AppState = {
  count: 0,
  message: 'Hello, World!'
}

// State update function
function updateState(newState: Partial<AppState>) {
  state = { ...state, ...newState }
  render()
}

// Component function
function App(state: AppState): VNode {
  return h('div', [
    h('h1', { style: { color: '#333', fontFamily: 'sans-serif' } }, state.message),
    h('p', `Count: ${state.count}`),
    h('button', {
      on: {
        click: () => updateState({ count: state.count + 1 })
      },
      style: {
        padding: '10px 20px',
        margin: '10px',
        backgroundColor: '#007acc',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }
    }, 'Increment'),
    h('button', {
      on: {
        click: () => updateState({ 
          message: state.message === 'Hello, World!' ? 'Hello, TypeScript!' : 'Hello, World!'
        })
      },
      style: {
        padding: '10px 20px',
        margin: '10px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }
    }, 'Toggle Message')
  ])
}

// Render function
let vnode: VNode | Element = document.getElementById('app')!

function render() {
  const newVnode = App(state)
  vnode = patch(vnode, newVnode)
}

// Initial render
render()

// Hot module replacement (HMR) support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Re-render without full page refresh
    render()
  })
}