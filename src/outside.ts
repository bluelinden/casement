import { Peer } from './peer';

interface OutsideOptions {
  name: string
  pageUrl?: string;
  onReady?: () => void,
  handlers: ((message: any, messageName?: any) => void | any)[],
  container?: HTMLElement,
  iFrame?: HTMLIFrameElement,
}

export default class Outside extends Peer {
  pageUrl: string;
  allowedDomain: string;
  onKill?: () => void;
  container?: HTMLElement;
  iFrame?: HTMLIFrameElement;
  allowSend: boolean = false;

  init() {
    window.addEventListener('message', (event) => {
      this.handleIncoming
    });
  }

  send(message: any, actionName?: string) {
    if (!this.allowSend) {
      console.warn('Casement Error: Cannot send message. The iFrame has not yet loaded, or has not yet confirmed that it is ready.');
      return;
    }
    if (!actionName) actionName = 'casement-message';
    // Send a message without expecting a response
    this.iFrame!.contentWindow!.postMessage({ 
      type: 'casement-outside-message', 
      message,
      actionName,
    }, this.allowedDomain);
  };

  on(messageName: string, handler: (message: any) => void | Promise<any>) {
    if (!this.onMessage) this.onMessage = [];
    this.onMessage.push({ name: messageName, callback: handler });
  }

  request(message: any, actionName?: string) {
    if (!this.allowSend) {
      console.warn('Casement Error: Cannot send message. The iFrame has not yet loaded, or has not yet confirmed that it is ready.');
      return;
    }
    // Send a message and expect a response
    return new Promise((resolve) => {
      // post a message to the parent window
      this.iFrame!.contentWindow!.postMessage({ 
        type: `casement-${this.name}-outside-request`, 
        transmissionID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 
        message,
        actionName,
      }, this.allowedDomain);

      // response handler
      const handleResponse = (event: MessageEvent) => {
        if (event.origin !== this.allowedDomain) return;
        if (event.data.type === `casement-${this.name}-inside-response` &&
          event.data.transmissionID === message.transmissionID) {
          window.removeEventListener('message', handleResponse)
          resolve(event.data.message);
        }
      }
      window.addEventListener('message', handleResponse);
    });
  }

  private handleIncoming(event: MessageEvent) {
    // Handle incoming messages. No response is needed.
    if (event.origin !== this.allowedDomain) return;
    switch (event.data.type) {
      case `casement-${this.name}-inside-ready`:
        this.allowSend = true;
        if (this.onReady) this.onReady();
        break;

      case `casement-${this.name}-inside-message` && event.data.actionName:
          if (this.onMessage) this.onMessage.forEach((handler) => {
            if (handler.name === event.data.actionName) handler.callback(event.data.message);
            else if (handler.name === '*') handler.callback(event.data.message, event.data.actionName);
          });

        // if there's no handler, warn the user
        else console.warn('Casement Error: Received a message from inside but no handler was set. Remember to pass a handler function to the "onMessage" option when creating a new casement.Outside instance.');
        break;

      // Handle incoming requests, specifically. Make all the handlers race to see which one will handle the request.
      case `casement-${this.name}-inside-request`:
        if (this.onMessage) {
          this.iFrame!.contentWindow!.postMessage({ 
              type: `casement-${this.name}-outside-response`, 
              message: Promise.all(this.onMessage.map((handler) => {
                if (handler.name === event.data.actionName) return handler.callback(event.data.message);
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
    this.iFrame!.contentWindow!.postMessage({ type: 'casement-outside-kill' }, this.allowedDomain);
    const killiFrame = (event: MessageEvent) => {
      if (event.origin !== this.allowedDomain) return;
      if (event.data.type === `casement-inside-${this.name}-kill-ready`) { // @ts-ignore
        this.iFrame!.remove();
        window.removeEventListener('message', killiFrame);
      }
    }
    if (!force) window.addEventListener('message', killiFrame);
    else if (force) {
      this.iFrame!.remove();
    }
  }

  constructor(config: OutsideOptions) {
    super();
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
