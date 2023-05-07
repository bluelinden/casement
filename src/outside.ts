interface OutsideOptions {
  name: string
  pageUrl?: string;
  allowedDomain: string;
  onReady?: () => void,
  onMessage?: (message: any) => void,
  onKill?: () => void,
  container?: HTMLElement,
  iFrame?: HTMLIFrameElement,
}

export default class Outside {
  name: string;
  pageUrl: string;
  allowedDomain: string;
  onReady?: () => void;
  onMessage?: (message: any) => void;
  onKill?: () => void;
  container?: HTMLElement;
  iFrame?: HTMLIFrameElement;

  init() {
    window.addEventListener('message', (event) => {
      if (this.allowedDomain !== event.origin) return;
      if (event.data.type === 'casement-inside-ready') {
        if (this.onReady) this.onReady();
      } else if (event.data.type === 'casement-inside-message') {
        if (this.onMessage) this.onMessage(event.data.message);
      } else if (event.data.type === 'casement-inside-kill') {
        if (this.onKill) this.onKill();
      }
    });
  }

  send(message: any) {
    // Send a message without expecting a response
    return new Promise((resolve, reject) => {
      this.iFrame.contentWindow!.postMessage({ type: 'casement-outside-message', message }, this.allowedDomain);
    });
  }

  request(message: any) {
    // Send a message and expect a response
    return new Promise((resolve, reject) => {
      this.iFrame.contentWindow!.postMessage({ type: 'casement-outside-request', message }, this.allowedDomain);
      window.addEventListener('message', (event) => {
        if (event.origin !== this.allowedDomain) return;
        if (event.data.type === 'casement-inside-response') {
          resolve(event.data.message);
        }
      });
    });
  }

  kill() {
    this.iFrame.contentWindow!.postMessage({ type: 'casement-outside-kill' }, this.allowedDomain);
  }

  constructor(config: OutsideOptions) {
    this.name = config.name;
    this.pageUrl = config.pageUrl || '/';
    this.allowedDomain = config.allowedDomain;
    if (config.onReady) this.onReady = config.onReady;
    if (config.onMessage) this.onMessage = config.onMessage;
    if (config.onKill) this.onKill = config.onKill;
    if (config.container) {
      this.container = config.container;
      this.iFrame = document.createElement('iframe');
      this.container.appendChild(this.iFrame);
    }
    if (config.iFrame) this.iFrame = config.iFrame;

    this.init();
  }
}
