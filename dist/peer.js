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
    exports.Peer = void 0;
    class Peer {
        constructor() {
            this.allowSend = false;
            this.name = 'default';
            this.debug = false;
            this.allowedDomain = '';
        }
        loggy(...args) {
            if (this.debug)
                console.info(...args);
        }
        warny(...args) {
            if (this.debug)
                console.warn(...args);
        }
        capitalizeFirstLetter(str) {
            if (str.length === 0) {
                return str; // Return empty string if input is empty
            }
            const firstLetter = str.charAt(0).toUpperCase(); // Get the first letter and capitalize it
            const restOfWord = str.slice(1); // Get the remaining letters
            return firstLetter + restOfWord;
        }
        sendAgnostic(isInside, message, actionName) {
            const here = isInside ? 'inside' : 'outside';
            const target = isInside ? window.parent : this.iFrame.contentWindow;
            if (!this.allowSend) {
                this.warny(`Casement: Cannot send message from ${here} window. The other side has not yet loaded, or has not yet confirmed that it is ready.`);
                return;
            }
            if (!actionName) {
                actionName = 'message';
                this.loggy('Casement: No actionName was provided. Using default actionName "message".');
            }
            // Send a message without expecting a response
            target.postMessage({
                type: 'casement-message',
                from: here,
                name: this.name,
                message,
                actionName,
            }, this.allowedDomain);
            this.loggy('Casement: Sent message to inside window.');
        }
        ;
        requestAgnostic(isInside, message, actionName) {
            const here = isInside ? 'inside' : 'outside';
            const there = isInside ? 'outside' : 'inside';
            const target = isInside ? window.parent : this.iFrame.contentWindow;
            if (!this.allowSend) {
                this.warny(`Casement: Cannot send request from ${here} window. The other side has not yet loaded, or has not yet confirmed that it is ready.`);
                return;
            }
            // Send a message and expect a response
            return new Promise((resolve) => {
                // post a message to the parent window
                const transmissionID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                target.postMessage({
                    type: `casement-request`,
                    from: here,
                    name: this.name,
                    transmissionID,
                    message,
                    actionName,
                }, this.allowedDomain);
                this.loggy(`Casement: Sent request to ${there} window, ID ${transmissionID}.`);
                // response handler
                const handleResponse = (event) => {
                    if (!this.domainCheck(event.origin)) {
                        this.warny(`Casement: Received response from ${there} window, but the origin (${event.origin}) did not match the allowed domain of ${this.allowedDomain}.`);
                        return;
                    }
                    this.loggy(`Casement: Received response from ${there} window, ID ${transmissionID}.`);
                    if (event.data.type === `casement-response` &&
                        event.data.transmissionID === message.transmissionID &&
                        event.data.name === this.name &&
                        event.data.from === there) {
                        window.removeEventListener('message', handleResponse);
                        resolve(event.data.message);
                        this.loggy(`Casement: Accepted response from ${there} window, ID ${transmissionID}.`);
                    }
                    else {
                        this.warny(`Casement: Received response from ${there} window, but something about the response did not match the request. This is likely a bug.`, event);
                    }
                };
                window.addEventListener('message', handleResponse);
                this.loggy(`Casement: Listening for response from ${there} window, ID ${transmissionID}.`);
            });
        }
        on(messageName, handler) {
            if (!this.onMessage)
                this.onMessage = [];
            this.onMessage.push({ name: messageName, callback: handler });
            this.loggy(`Casement: Registered handler for message "${messageName}".`);
        }
        handleIncomingAgnostic(event, isInside) {
            const here = isInside ? 'inside' : 'outside';
            const there = isInside ? 'outside' : 'inside';
            const target = isInside ? window.parent : this.iFrame.contentWindow;
            this.loggy(`Casement: Incoming parser called.`, event);
            // Handle incoming messages. No response is needed.
            if (this.domainCheck(event.origin)) {
                this.warny(`Casement: Received message from ${there} window, but the origin (${event.origin}) did not match the allowed domain of ${this.allowedDomain}.`, event);
                return;
            }
            if (event.data.name !== this.name) {
                this.warny(`Casement: Received message from ${there} window, but the name (${event.data.name}) did not match the expected name of ${this.name}.`, event);
                return;
            }
            if (event.data.from !== there) {
                this.warny(`Casement: Received message appears to not come from ${there}. Not handling out of precaution.`, event);
                return;
            }
            switch (event.data.type) {
                case `casement-ready`:
                    this.handleReadinessAgnostic(event, isInside);
                    break;
                case `casement-message`:
                    this.loggy(`Casement: Received categorized message from ${there} window.`);
                    let didHandle = false;
                    if (this.onMessage)
                        this.onMessage.forEach((handler) => {
                            if (handler.name === event.data.actionName || handler.name === '*') {
                                this.loggy(`Casement: Accepted categorized message from ${there} window, actionName ${event.data.actionName}.`);
                                handler.callback(event.data.message);
                                didHandle = true;
                            }
                        });
                    // if there's no handler, warn the user
                    if (!didHandle)
                        this.warny(`Casement: Received a message from ${there} but no handler was set for action name ${event.data.actionName}. Make sure to use the ${this.capitalizeFirstLetter(here)}.on() method to set a handler for this request.`, event);
                    break;
                // Handle incoming requests, specifically. Call all callbacks.
                case `casement-request`:
                    this.loggy(`Casement: Received request from ${there} window, ID ${event.data.transmissionID}.`);
                    if (this.onMessage) {
                        target.postMessage({
                            type: `casement-response`,
                            message: Promise.all(this.onMessage.map((handler) => {
                                if (handler.name === event.data.actionName) {
                                    this.loggy(`Casement: Accepted request from ${there} window, actionName ${event.data.actionName}.`);
                                    return handler.callback(event.data.message);
                                }
                                else if (handler.name === '*')
                                    return handler.callback(event.data.message, event.data.actionName);
                            })),
                            name: this.name,
                            transmissionID: event.data.transmissionID,
                            from: here,
                        }, this.allowedDomain);
                    }
                    else
                        this.warny(`Casement: Received a request from ${there} but no handler was set. Make sure to use the ${this.capitalizeFirstLetter(here)}.on() method to set a handler for this request.`);
                    break;
            }
        }
        handleReadinessAgnostic(event, isInside) {
            var _a;
            const here = isInside ? 'inside' : 'outside';
            const there = isInside ? 'outside' : 'inside';
            const name = event.data.name;
            this.loggy(`Casement: ${here} readiness handler called.`);
            // If the message is from the inside, send a ready message back and set the allowSend flag to true.
            // If the message is from the outside, set the allowSend flag to true.
            if (!this.domainCheck(event.origin)) {
                this.loggy(`Casement: Received ready message from ${there} window, but the origin did not match the allowed domain.`);
                return;
            }
            if (name !== this.name) {
                this.loggy(`Casement: Received ready message from ${here} window, but the name did not match the allowed name.`);
                return;
            }
            switch (event.data.from) {
                // if the message came from the inside, send a ready message back and set the allowSend flag to true
                case 'inside':
                    this.loggy(`Casement: Received ready message from inside window. Sending one back...`);
                    this.allowSend = true;
                    if ((_a = this.iFrame) === null || _a === void 0 ? void 0 : _a.contentWindow)
                        this.iFrame.contentWindow.postMessage({
                            type: `casement-ready`,
                            from: 'outside',
                            name: this.name
                        }, this.allowedDomain);
                    if (this.onReady)
                        this.onReady();
                    break;
                // if the message came from the outside, set the allowSend flag to true
                case 'outside':
                    if (event.data.name === this.name)
                        this.loggy(`Casement: Received ready message from outside window. Data channel is now open and both sides can send messages.`);
                    this.allowSend = true;
                    if (this.onReady)
                        this.onReady();
                    break;
                default:
                    this.loggy(`Casement: Received a malformed ready message missing a 'from' property.`);
            }
        }
        domainCheck(domain) {
            switch (domain) {
                case '*':
                    return true; // allow all domains
                case window.location.origin:
                    return true; // allow same origin
                case this.allowedDomain:
                    return true; // allow specified domain
                default:
                    if (this.allowedDomain === '*')
                        return true; // allow all domains
                    else
                        return false; // block all other domains
            }
        }
    }
    exports.Peer = Peer;
});
