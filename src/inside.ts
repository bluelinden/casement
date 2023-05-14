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
  allowSend: boolean = false;
  debug: boolean = false;

  loggy(...args: any[]) {
    if (this.debug) console.info(...args);
  }

  init() {
    window.addEventListener('message', (event) => {
      this.handleIncomingAgnostic(event, true);
    });
    this.loggy('Casement: Sending ready message to outside window and listening for responses.')
    window.parent.postMessage({
      type: 'casement-ready',
      from: 'inside',
      name: this.name,
    }, this.allowedDomain);
  }

  send(message: any, actionName?: string) {
    this.sendAgnostic(true, message, actionName);
  }

  request(message: any, actionName?: string) {
    return this.requestAgnostic(true, message, actionName);
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
