var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./inside", "./outside"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const inside_1 = __importDefault(require("./inside"));
    const outside_1 = __importDefault(require("./outside"));
    const casement = {
        Inside: inside_1.default,
        Outside: outside_1.default
    };
    exports.default = casement;
});
