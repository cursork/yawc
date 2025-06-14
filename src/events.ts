import { yawc } from './yawc'
import type { YawcComponent } from './types'

export function sendEvent(component: YawcComponent, eventName: string, info?: any): void {
  if (!component.Properties.Event) {
    return
  }
  
  const supportedEvents = component.Properties.Event as string[][]
  const supportsEvent = supportedEvents.some(([name]) => name === eventName)
  
  if (!supportsEvent) {
    return
  }
  
  const eventMessage = {
    Event: {
      EventName: eventName,
      ID: component.ID,
      ...(info ? { Info: info } : {})
    }
  }
  
  // TODO: Debug double-send issue - event is being sent twice to server
  // This happens during button click tests, needs investigation
  yawc.W.send(eventMessage)
}

export function hasEvent(component: YawcComponent, eventName: string): boolean {
  if (!component.Properties.Event) {
    return false
  }
  
  const supportedEvents = component.Properties.Event as string[][]
  return supportedEvents.some(([name]) => name === eventName)
}