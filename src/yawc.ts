import { Tree } from './tree'
import { SnabbdomRenderer } from './renderer'
import { WS } from './websocket'
import { Queue } from './queue'
import type { Yawc, ComponentRegistry } from './types'
import { Button } from './components/Button'
import { Combo } from './components/Combo'
import { Edit } from './components/Edit'
import { Form } from './components/Form'
import { SubForm } from './components/SubForm'
import { Label } from './components/Label'

// Component registry
const componentRegistry: ComponentRegistry = {
  Button,
  Combo,
  Edit,
  Form,
  SubForm,
  Label
}

// Global yawc instance
export const yawc: Yawc = {
  T: new Tree(),
  R: new SnabbdomRenderer(),
  W: new WS(),
  Q: new Queue(),
  C: componentRegistry
}

// Make yawc available globally in browser
if (typeof window !== 'undefined') {
  (window as any).yawc = yawc
}