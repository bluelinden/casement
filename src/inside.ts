interface InsideOptions {
  name: string
  allowedDomain: string;
  onReady?: () => void,
  onMessage?: (message: any) => void,
}

export default class Inside {
  name: string;
  allowedDomain: string;
  onReady?: () => void;
  onMessage?: (message: any) => void;

  init() {
    window.addEventListener('message', (event) => {
      if (this.allowedDomain !== event.origin) return;
      if (event.data.type === 'casement-outside-ready') {
        if (this.onReady) this.onReady();
      } else if (event.data.type === 'casement-outside-message') {
        if (this.onMessage) this.onMessage(event.data.message);
      }
    });
    window.parent.postMessage({ type: 'casement-inside-ready', name: this.name }, this.allowedDomain);
  }

  send(message: any) {
    // Send a message without expecting a response
    return new Promise((resolve, reject) => {
      window.parent.postMessage({ type: 'casement-inside-message', message }, this.allowedDomain);
    });
  }

  request(message: any) {
    // Send a message and expect a response
    return new Promise((resolve, reject) => {
      window.parent.postMessage({ type: 'casement-inside-request', transmissionID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), message }, this.allowedDomain);
      const handleResponse = (event: MessageEvent) => {
        if (event.origin !== this.allowedDomain) return;
        if (event.data.type === 'casement-outside-response' &&
          event.data.transmissionID === message.transmissionID) {
          window.removeEventListener('message', handleResponse)
          resolve(event.data.message);
        }
      }
      window.addEventListener('message', handleResponse);
    });
  }

  constructor(config: InsideOptions) {
    this.name = config.name;
    this.allowedDomain = config.allowedDomain;
    if (config.onReady) this.onReady = config.onReady;
    if (config.onMessage) this.onMessage = config.onMessage;

    this.init();
  }
}