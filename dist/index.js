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
    exports.Outside = exports.Inside = void 0;
    const inside_1 = __importDefault(require("./inside"));
    exports.Inside = inside_1.default;
    const outside_1 = __importDefault(require("./outside"));
    exports.Outside = outside_1.default;
});
