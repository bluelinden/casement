import { Peer } from './peer.js';

interface OutsideOptions {
  name: string
  pageUrl?: string;
  onReady?: () => void,
  handlers: ((message: any, messageName?: any) => void | any)[],
  container?: HTMLElement,
  iFrame?: HTMLIFrameElement,
  debug?: boolean,
}

export default class Outside extends Peer {
  pageUrl: string;
  allowedDomain: string;
  onKill?: () => void;
  container?: HTMLElement;
  iFrame?: HTMLIFrameElement;
  allowSend: boolean = false;
  debug: boolean = false;

  loggy(...args: any[]) {
    if (this.debug) console.info(...args);
  }

  init() {
    window.addEventListener('message', (event) => {
      this.handleIncoming(event);
    });
    this.loggy('Casement: Listening for ready message from inside window.')
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
    this.iFrame!.contentWindow!.postMessage({ 
      type: 'casement-outside-message', 
      message,
      actionName,
    }, this.allowedDomain);
    this.loggy('Casement: Sent message to inside window.');
  };

  on(messageName: string, handler: (message: any) => void | Promise<any>) {
    if (!this.onMessage) this.onMessage = [];
    this.onMessage.push({ name: messageName, callback: handler });
    this.loggy(`Casement: Registered handler for message "${messageName}".`);
  }

  request(message: any, actionName?: string) {
    if (!this.allowSend) {
      console.warn('Casement Error: Cannot send message. The iFrame has not yet loaded, or has not yet confirmed that it is ready.');
      return;
    }
    // Send a message and expect a response
    return new Promise((resolve) => {
      // post a message to the parent window
      const transmissionID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.iFrame!.contentWindow!.postMessage({ 
        type: `casement-${this.name}-outside-request`, 
        transmissionID, 
        message,
        actionName,
      }, this.allowedDomain);
      this.loggy(`Casement: Sent request to inside window, ID ${transmissionID}.`);

      // response handler
      const handleResponse = (event: MessageEvent) => {
        if (event.origin !== this.allowedDomain && this.allowedDomain !== '*') return;
        this.loggy(`Casement: Received response from inside window, ID ${transmissionID}.`)
        if (event.data.type === `casement-${this.name}-inside-response` &&
          event.data.transmissionID === message.transmissionID) {
          window.removeEventListener('message', handleResponse)
          resolve(event.data.message);
          this.loggy(`Casement: Accepted response from inside window, ID ${transmissionID}.`);
        }
      }
      window.addEventListener('message', handleResponse);
      this.loggy(`Casement: Listening for response from inside window, ID ${transmissionID}.`);
    });
  }

  private handleIncoming(event: MessageEvent) {
    this.loggy('Casement: Incoming parser called.');
    // Handle incoming messages. No response is needed.
    if (event.origin !== this.allowedDomain && this.allowedDomain !== '*') return;
    switch (event.data.type) {
      case `casement-${this.name}-inside-ready`:
        this.iFrame!.contentWindow!.postMessage({ type: `casement-${this.name}-outside-ready` }, this.allowedDomain);
        this.loggy(`Casement: Received ready message from inside window.`)
        this.allowSend = true;
        if (this.onReady) this.onReady();
        break;

      case `casement-${this.name}-inside-message` && event.data.actionName:
        this.loggy(`Casement: Recieved categorized message from inside window.`)
        if (this.onMessage) this.onMessage.forEach((handler) => {
          if (handler.name === event.data.actionName) {
            handler.callback(event.data.message);
            this.loggy(`Casement: Accepted categorized message from inside window, actionName ${event.data.actionName}.`)
          }
          else if (handler.name === '*') {handler.callback(event.data.message, event.data.actionName); this.loggy(`Casement: Accepted categorized message from inside window, actionName ${event.data.actionName}.`);}
        });

        // if there's no handler, warn the user
        else console.warn('Casement Error: Received a message from inside but no handler was set. Make sure to use the outside.on() method to set a handler for this message type.');
        break;

      // Handle incoming requests, specifically. Call all callbacks.
      case `casement-${this.name}-inside-request`:
        this.loggy(`Casement: Received request from inside window, ID ${event.data.transmissionID}.`)
        if (this.onMessage) {
          this.iFrame!.contentWindow!.postMessage({ 
              type: `casement-${this.name}-outside-response`, 
              message: Promise.all(this.onMessage.map((handler) => {
                if (handler.name === event.data.actionName) {
                  this.loggy(`Casement: Accepted request from inside window, ID ${event.data.transmissionID}.`)
                  return handler.callback(event.data.message);
                }
                else if (handler.name === '*') return handler.callback(event.data.message, event.data.actionName);
              }))
            }, 
            this.allowedDomain
          );
        }
        else console.warn('Casement Error: Received a request from inside but no handler was set. Remember to pass a handler function to the "onMessage" option when creating a new casement.Outside instance.');
        break;
    }
  }

  kill(force: boolean = false) {
    if (this.onKill) this.onKill();
    this.loggy('Casement: Killing iFrame.');
    this.iFrame!.contentWindow!.postMessage({ type: 'casement-outside-kill' }, this.allowedDomain);
    const killiFrame = (event: MessageEvent) => {
      if (event.origin !== this.allowedDomain && this.allowedDomain !== '*') return;
      if (event.data.type === `casement-inside-${this.name}-kill-ready`) { // @ts-ignore
        this.iFrame!.remove();
        this.loggy('Casement: iFrame killed.');
        window.removeEventListener('message', killiFrame);
      }
    }
    if (!force) {
      window.addEventListener('message', killiFrame);
      this.loggy('Casement: Waiting for iFrame kill confirmation.');
    }
    else if (force) {
      this.iFrame!.remove();
      this.loggy('Casement: iFrame killed.');
    }
  }

  constructor(config: OutsideOptions) {
    super();
    if (config.debug) this.debug = config.debug;
    this.loggy('Casement: Outside instance created.');
    this.name = config.name;
    this.pageUrl = config.pageUrl || '/';
    this.allowedDomain = this.pageUrl.split('/').slice(0, 3).join('/');
    if (config.onReady) this.onReady = config.onReady;
    if (config.container) {
      this.container = config.container;
      this.iFrame = document.createElement('iframe');
      this.iFrame.src = this.pageUrl;
      this.container.appendChild(this.iFrame);
    } else if (config.iFrame) this.iFrame = config.iFrame;

    this.init();
  }
}
