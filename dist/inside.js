import { Peer } from './peer.js';
export default class Inside extends Peer {
    loggy(...args) {
        if (this.debug)
            console.info(...args);
    }
    init() {
        window.addEventListener('message', (event) => {
            this.handleIncomingAgnostic(event, true);
        });
        this.loggy('Casement: Sending ready message to outside window and listening for responses.');
        window.parent.postMessage({
            type: 'casement-ready',
            from: 'inside',
            name: this.name,
        }, this.allowedDomain);
    }
    send(message, actionName) {
        this.sendAgnostic(true, message, actionName);
    }
    request(message, actionName) {
        return this.requestAgnostic(true, message, actionName);
    }
    constructor(config) {
        super();
        this.allowSend = false;
        this.debug = false;
        if (config.debug)
            this.debug = config.debug;
        this.loggy(`Casement: Initializing inside window.`);
        this.name = config.name;
        this.allowedDomain = config.allowedDomain;
        if (config.onReady)
            this.onReady = config.onReady;
        this.init();
    }
}
