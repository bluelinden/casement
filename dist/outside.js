(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./peer.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const peer_js_1 = require("./peer.js");
    class Outside extends peer_js_1.Peer {
        init() {
            window.addEventListener('message', (event) => {
                this.handleIncomingAgnostic(event, false);
            });
            this.loggy('Casement: Listening for ready message from inside window.');
        }
        send(message, actionName) {
            this.sendAgnostic(false, message, actionName);
        }
        request(message, actionName) {
            return this.requestAgnostic(false, message, actionName);
        }
        constructor(config) {
            super();
            this.allowSend = false;
            this.debug = false;
            if (config.debug)
                this.debug = config.debug;
            this.loggy('Casement: Outside instance created.');
            this.name = config.name;
            this.pageUrl = config.pageUrl || window.location.href;
            this.allowedDomain = new URL(this.pageUrl).origin;
            if (config.onReady)
                this.onReady = config.onReady;
            if (config.container) {
                this.container = config.container;
                this.iFrame = document.createElement('iframe');
                this.iFrame.src = this.pageUrl;
                this.container.appendChild(this.iFrame);
            }
            else if (config.iFrame)
                this.iFrame = config.iFrame;
            this.init();
        }
    }
    exports.default = Outside;
});
