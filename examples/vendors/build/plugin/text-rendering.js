(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.dsr = global.dsr || {})));
}(this, (function (exports) { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var TextRendering = function TextRendering(gl, textLayout) {
  	classCallCheck(this, TextRendering);
  };

  exports.TextRendering = TextRendering;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
