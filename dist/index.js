var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./inside.js", "./outside.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Outside = exports.Inside = void 0;
    const inside_js_1 = __importDefault(require("./inside.js"));
    exports.Inside = inside_js_1.default;
    const outside_js_1 = __importDefault(require("./outside.js"));
    exports.Outside = outside_js_1.default;
});
