import { yawc } from './yawc'

// Example usage - create the structure from DESIGN.md
function createExample() {
  // Create Form
  yawc.T.create('F1', 'Form')
  
  // Create SubForm inside Form
  yawc.T.create('F1.SF', 'SubForm')
  
  // Create Label inside SubForm
  yawc.T.create('F1.SF.L1', 'Label')
  yawc.T.mergeProps('F1.SF.L1', { Caption: 'This is the text of the label' })
  
  // Render the application
  yawc.R.render()
}

// Initialize the application
createExample()

// Set up WebSocket message handlers (when connecting to EWC server)
yawc.W.onWC((data) => {
  if (!data.ID) {
    console.error('WC message missing ID:', data)
    return
  }
  if (!data.Properties?.Type) {
    console.error('WC message missing Type in Properties:', data)
    return
  }
  yawc.T.create(data.ID, data.Properties.Type, data.Properties)
  yawc.R.render()
})

yawc.W.onWS((data) => {
  if (!data.ID) {
    console.error('WS message missing ID:', data)
    return
  }
  if (!data.Properties) {
    console.error('WS message missing Properties:', data)
    return
  }
  yawc.T.mergeProps(data.ID, data.Properties)
  yawc.R.render()
})

yawc.W.onWG((data) => {
  if (!data.ID) {
    console.error('WG message missing ID:', data)
    return
  }
  if (!data.Properties || !Array.isArray(data.Properties)) {
    console.error('WG message missing Properties array:', data)
    return
  }
  
  const component = yawc.T.find(data.ID)
  if (!component) {
    console.error('WG requested properties for unknown component:', data.ID)
    return
  }
  
  // Build response with requested properties
  const responseProperties: any = {}
  data.Properties.forEach((propName: string) => {
    if (component.Properties && component.Properties[propName] !== undefined) {
      responseProperties[propName] = component.Properties[propName]
    }
  })
  
  // Send WG response
  const response = {
    WG: {
      ID: data.ID,
      Properties: responseProperties,
      WGID: data.WGID
    }
  }
  
  console.log('Sending WG response:', response)
  yawc.W.send(response)
})

yawc.W.onNQ((data) => {
  console.log('NQ message:', data)
  yawc.Q.handleResponse({ NQ: data })
})

// Auto-connect if CONNECT_PORT is set via Vite
if (import.meta.env.CONNECT_PORT) {
  const port = import.meta.env.CONNECT_PORT
  console.log(`Auto-connecting to ws://localhost:${port}`)
  yawc.W.connect(`ws://localhost:${port}`)
} else {
  createExample()
}

console.log('yawc initialized. Check window.yawc for global access.')