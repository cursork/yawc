# Design for yawc (WIP)

## Preamble

yawc is another approach to a JS client for EWC (https://github.com/Dyalog/ewc)
\- see https://github.com/Dyalog/ewc-client for an existing implementation. It
attempts to take lessons learned from that and implement a cleaner design.

EWC is an emulation of ⎕WC in Dyalog APL, which is used to build Windows
applications.

The EWC server and client communicate over WebSockets to create, update and
destroy components. The relevant messages are: WC (create), WS (set property),
WG (get property), EX (expunge/destroy) and NQ (enqueue a message).

## Architecture

There are several main components that seem clear, although the boundaries of
responsibility may blur on occasion.

All state is global and is to be held in a single `yawc` variable - this will be
`window.yawc` in the browser.

### yawc.T (Tree)

This is a tree structure consisting of all state for the application. At all
times, it should be possible to rerender the entire page from it. It will look
something like:

{
    Roots: {
        'F1': {
            ID: 'F1',
            Type: 'Form',
            Children: [
                'F1.SF': {
                    ID: 'F1.SF',
                    Type: 'SubForm',
                    Children: [
                        'F1.SF.L1': {
                            ID: 'F1.SF.L1',
                            Type: 'Label',
                            Properties: {
                                Caption: 'This is the text of the label',
                            },
                        },
                    ],
                },
            ],
        },
    },
}

That is: a Form (think window) with a SubForm containing a Label with the text
inside the Caption property.

TODO: Since these will be accessed a lot, I am considering reducing the standard
keys to: R, I, T, C and P for Roots, ID, Type, Children, Properties
respectively. All Properties (such as Caption) would remain verbatim. Same
example as above:

{
    R: {
        'F1': {
            I: 'F1',
            T: 'Form',
            C: [
                'F1.SF': {
                    I: 'F1.SF',
                    T: 'SubForm',
                    C: {
                        'F1.SF.L1': {
                            I: 'F1.SF.L1',
                            T: 'Label',
                            P: {
                                Caption: 'This is the text of the label',
                            },
                        },
                    },
                },
            ],
        },
    },
}

### yawc.R (Renderer)

The renderer is intended to be replaceable. Initially it will only be a HTML/JS
browser renderer using snabbdom. Future ones could be implemented for CLI or for
native GUI libraries.

It's JS API is simple:

```
render('F1')       // Full rerender of the Form and all children
render('F1.SF.L1') // Only rerender the Label (we know it's the only change)
```

There will be a library of components. Using the above example, we may have .ts
files such as Form.ts, SubForm.ts and Label.ts.

### yawc.W (WebSocket communications)

Maintains a WebSocket connection to the server and handles all incoming and
outgoing requests. _This is massively complicated_ by the fact some request
messages should always return and others should queue messages. For example:

1. WC to create an input, it's Event property is set to 'KeyPress' - this
   should not accept the KeyPress (and therefore change the input field's state
   until it gets a response from the server to confirm)
2. User presses a key - the KeyPress is sent to the server with an NQ message
   containing that 'a' and it is suppressed
3. The server wants to know the state of the input before 'a' was pressed, so
   issues a WG on the ID. _This happens immediately_
4. The server may want to send other WC/WS/WG commands that happen immediately.
5. The server NQs its response indicating to accept the KeyPress or not and it
   is actioned (see yawc.Q)

### yawc.Q (Queues)

See some detail in yawc.W. We need to not send a new NQ message until we've
received the response of the previous one. `yawc.Q.send(msg, cb)` will ensure
that. A very common usage of the queue for JS client to APL server is to call
`preventDefault()` and create a `cb` callback that carries out the desired
action if a response with `Proceed: 1` is received.

We will require timeouts, but not in phase 1 of this implementation.