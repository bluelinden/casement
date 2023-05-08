(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Inside {
        init() {
            window.addEventListener('message', (event) => {
                this.handleIncoming;
            });
            window.parent.postMessage({ type: 'casement-inside-ready', name: this.name }, this.allowedDomain);
        }
        send(message) {
            // Send a message without expecting a response
            return new Promise((resolve, reject) => {
                window.parent.postMessage({ type: 'casement-inside-message', message }, this.allowedDomain);
            });
        }
        request(message) {
            // Send a message and expect a response
            return new Promise((resolve) => {
                // post a message to the parent window
                window.parent.postMessage({
                    type: `casement-${this.name}-inside-request`,
                    transmissionID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    message
                }, this.allowedDomain);
                // response handler
                const handleResponse = (event) => {
                    if (event.origin !== this.allowedDomain)
                        return;
                    if (event.data.type === `casement-${this.name}-outside-response` &&
                        event.data.transmissionID === message.transmissionID) {
                        window.removeEventListener('message', handleResponse);
                        resolve(event.data.message);
                    }
                };
                window.addEventListener('message', handleResponse);
            });
        }
        handleIncoming(event) {
            // Handle incoming messages. No response is needed.
            if (event.origin !== this.allowedDomain)
                return;
            if (event.data.type === `casement-${this.name}-outside-message`) {
                // if there's a handler, call it
                if (this.onMessage)
                    this.onMessage(event.data.message);
                // if there's no handler, warn the user
                else
                    console.warn('Casement Error: Received a message from outside but no handler was set. Remember to pass a handler function to the "onMessage" option when creating a new casement.Inside instance.');
            }
            // Handle incoming requests, specifically. Call the handler and send a response with its return value.
            if (event.data.type === `casement-${this.name}-outside-request`) {
                if (this.onMessage) {
                    window.parent.postMessage({
                        type: `casement-${this.name}-inside-response`,
                        message: this.onMessage(event.data.message)
                    }, this.allowedDomain);
                }
                else
                    console.warn('Casement Error: Received a request from outside but no handler was set. Remember to pass a handler function to the "onMessage" option when creating a new casement.Inside instance.');
            }
        }
        constructor(config) {
            this.name = config.name;
            this.allowedDomain = config.allowedDomain;
            if (config.onReady)
                this.onReady = config.onReady;
            if (config.onMessage)
                this.onMessage = config.onMessage;
            this.init();
        }
    }
    exports.default = Inside;
});
