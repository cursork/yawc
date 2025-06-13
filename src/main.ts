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
  if (!data.Type) {
    console.error('WC message missing Type:', data)
    return
  }
  if (!data.ID) {
    console.error('WC message missing ID:', data)
    return
  }
  yawc.T.create(data.ID, data.Type, data.Properties)
  yawc.R.render()
})

yawc.W.onWS((data) => {
  if (!data.ID) {
    console.error('WS message missing ID:', data)
    return
  }
  if (data.Properties) {
    yawc.T.mergeProps(data.ID, data.Properties)
  }
  yawc.R.render()
})

yawc.W.onNQ((data) => {
  console.log('NQ message:', data)
  yawc.Q.handleResponse({ NQ: data })
})

// Example of connecting to EWC server (commented out for demo)
// yawc.W.connect('ws://localhost:8080')

console.log('yawc initialized. Check window.yawc for global access.')