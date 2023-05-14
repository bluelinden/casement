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
  container?: HTMLElement;
  iFrame?: HTMLIFrameElement;
  allowSend: boolean = false;
  debug: boolean = false;

  init() {
    window.addEventListener('message', (event) => {
      this.handleIncomingAgnostic(event, false);
    });
    this.loggy('Casement: Listening for ready message from inside window.')
  }

  send(message: any, actionName?: string) {
    this.sendAgnostic(false, message, actionName);
  }

  request(message: any, actionName?: string) {
    return this.requestAgnostic(false, message, actionName);
  }

  constructor(config: OutsideOptions) {
    super();
    if (config.debug) this.debug = config.debug;
    this.loggy('Casement: Outside instance created.');
    this.name = config.name;
    this.pageUrl = config.pageUrl || window.location.href;
    this.allowedDomain = new URL(this.pageUrl).origin;
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
