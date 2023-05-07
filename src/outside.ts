interface OutsideOptions {
  name: string
  pageUrl?: string;
  allowedDomain: string;
  onReady?: () => void,
  onMessage: (message: any) => void,
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
    this.iFrame!.contentWindow!.postMessage({ type: 'casement-outside-message', message }, this.allowedDomain);
  };

  request(message: any) {
    // Send a message and expect a response
    return new Promise((resolve) => {
      this.iFrame!.contentWindow!.postMessage({ type: 'casement-outside-request', transmissionID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), message }, this.allowedDomain);
      const handleResponse = (event: MessageEvent) => {
        if (event.origin !== this.allowedDomain) return;
        if (event.data.type === 'casement-inside-response' && 
            event.data.transmissionID === message.transmissionID) {
          window.removeEventListener('message', handleResponse)
          resolve(event.data.message);
        }
      }
      window.addEventListener('message', handleResponse);
    });
  }

  kill(force: boolean = false) {
    this.iFrame!.contentWindow!.postMessage({ type: 'casement-outside-kill' }, this.allowedDomain);
    const killiFrame = (event: MessageEvent) => {
      if (event.origin !== this.allowedDomain) return;
      if (event.data.type === 'casement-inside-kill-ready') { // @ts-ignore
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
    this.name = config.name;
    this.pageUrl = config.pageUrl || '/';
    this.allowedDomain = config.allowedDomain;
    if (config.onReady) this.onReady = config.onReady;
    if (config.onMessage) this.onMessage = config.onMessage;
    if (config.onKill) this.onKill = config.onKill;
    if (config.container) {
      this.container = config.container;
      this.iFrame = document.createElement('iframe');
      this.iFrame.src = this.pageUrl;
      this.container.appendChild(this.iFrame);
    } else if (config.iFrame) this.iFrame = config.iFrame;

    this.init();
  }
}
