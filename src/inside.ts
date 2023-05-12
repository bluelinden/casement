import { Peer } from './peer.js';

// The options that can be passed to the constructor
interface InsideOptions {
  name: string
  allowedDomain: string;
  onReady?: () => void,
  debug?: boolean,
}

export default class Inside extends Peer {
  allowedDomain: string;
  onKill?: () => void;
  container?: HTMLElement;
  allowSend: boolean = false;
  debug: boolean = false;

  loggy(...args: any[]) {
    if (this.debug) console.info(...args);
  }

  init() {
    window.addEventListener('message', (event) => {
      this.handleIncoming(event);
    });
    this.loggy('Casement: Sending ready message to outside window and listening for responses.')
    window.parent.postMessage({ type: `casement-${this.name}-inside-ready` });
  }

  send(message: any, actionName?: string) {
    if (!this.allowSend) {
      console.warn('Casement Error: Cannot send message. The iFrame has not yet loaded, or has not yet confirmed that it is ready.');
      return;
    }
    if (!actionName) {
      actionName = 'casement-message';
      this.loggy('Casement: No actionName was provided. Using default actionName "casement-message".');
    }
    // Send a message without expecting a response
    window.parent.postMessage({ 
      type: 'casement-inside-message', 
      message,
      actionName,
    }, this.allowedDomain);
    this.loggy('Casement: Sent message to outside window.');
  };

  on(messageName: string, handler: (message: any) => void | Promise<any>) {
    if (!this.onMessage) this.onMessage = [];
    this.onMessage.push({ name: messageName, callback: handler });
    this.loggy(`Casement: Registered handler for message "${messageName}".`);
  }

  request(message: any, actionName?: string) {
    if (!this.allowSend) {
      console.warn('Casement Error: Cannot send message. The outside window has not yet confirmed that it is ready. Make sure the outside window is properly able to send messages to this window.');
      return;
    }
    // Send a message and expect a response
    return new Promise((resolve) => {
      // post a message to the parent window
      const transmissionID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      window.parent.postMessage({ 
        type: `casement-${this.name}-inside-request`, 
        transmissionID, 
        message,
        actionName,
      }, this.allowedDomain);
      this.loggy(`Casement: Sent request to outside window, ID ${transmissionID}.`);

      // response handler
      const handleResponse = (event: MessageEvent) => {
        if (event.origin !== this.allowedDomain) return;
        this.loggy(`Casement: Received response from outside window, ID ${event.data.transmissionID}.`);
        if (event.data.type === `casement-${this.name}-inside-response` &&
          event.data.transmissionID === message.transmissionID) {
          window.removeEventListener('message', handleResponse)
          resolve(event.data.message);
          this.loggy(`Casement: Accepted response from outside window, ID ${event.data.transmissionID}.`);
        }

      }
      window.addEventListener('message', handleResponse);
      this.loggy(`Casement: Listening for response from outside window, ID ${transmissionID}.`);
    });
  }

  private handleIncoming(event: MessageEvent) {
    this.loggy(`Casement: Incoming parser called.`);
    // Handle incoming messages. No response is needed.
    if (event.origin !== this.allowedDomain) return;
    switch (event.data.type) {
      case `casement-${this.name}-outside-ready`:
        this.loggy(`Casement: Received ready message from outside window.`);
        this.allowSend = true;
        if (this.onReady) this.onReady();
        break;

      case `casement-${this.name}-outside-message` && event.data.actionName:
        this.loggy(`Casement: Received categorized message from outside window.`);
        if (this.onMessage) this.onMessage.forEach((handler) => {
          if (handler.name === event.data.actionName) {
            handler.callback(event.data.message);
            this.loggy(`Casement: Accepted categorized message from outside window, actionName ${event.data.actionName}.`);
          }
          else if (handler.name === '*') {
            handler.callback(event.data.message, event.data.actionName);
            this.loggy(`Casement: Accepted categorized message from outside window, actionName ${event.data.actionName}.`);
          };
        });

        // if there's no handler, warn the user
        else console.warn('Casement Error: Received a message from outside but no handler was set. Make sure to use the inside.on() method to set a handler for this request.');
        break;

      // Handle incoming requests, specifically. Call all callbacks.
      case `casement-${this.name}-outside-request`:
        this.loggy(`Casement: Received request from outside window, ID ${event.data.transmissionID}.`);
        if (this.onMessage) {
          window.parent.postMessage({ 
              type: `casement-${this.name}-inside-response`, 
              message: Promise.all(this.onMessage.map((handler) => {
                if (handler.name === event.data.actionName) {
                  this.loggy(`Casement: Accepted request from outside window, actionName ${event.data.actionName}.`);
                  return handler.callback(event.data.message);
                }
                else if (handler.name === '*') return handler.callback(event.data.message, event.data.actionName);
              }))
            }, 
            this.allowedDomain
          );
        }
        else console.warn('Casement Error: Received a request from outside but no handler was set. Make sure to use the inside.on() method to set a handler for this request.');
        break;
      case `casement-${this.name}-outside-ready`:
        this.allowSend = true;
        if (this.onReady) this.onReady();
    }
  }

  kill(force: boolean = false) {
    if (force && this.onKill) this.onKill();
    this.loggy(`Casement: Sending kill message to outside window.`);
    window.parent.postMessage({ type: `casement-${this.name}-inside-kill-ready` });
  }

  constructor(config: InsideOptions) {
    super();
    if (config.debug) this.debug = config.debug;
    this.loggy(`Casement: Initializing inside window.`);
    this.name = config.name;
    this.allowedDomain = config.allowedDomain;
    if (config.onReady) this.onReady = config.onReady;

    this.init();
  }
}
