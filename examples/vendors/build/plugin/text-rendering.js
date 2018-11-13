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

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var TextRendering = function TextRendering(gl, textLayout, bitmapImage) {
  	classCallCheck(this, TextRendering);

  	var vertices = [];
  	var uvs = [];
  	var indices = [];

  	var imageWidth = bitmapImage.width;
  	var imageHeight = bitmapImage.height;

  	textLayout.glyphs.forEach(function (glyph, index) {
  		var bitmap = glyph.data;

  		var _glyph$position = slicedToArray(glyph.position, 2),
  		    xx = _glyph$position[0],
  		    yy = _glyph$position[1];

  		var startX = xx + bitmap.xoffset - textLayout.width / 2;
  		var endX = startX + bitmap.width;
  		var startY = -1 * (yy + bitmap.yoffset + textLayout.height / 2);
  		var endY = startY - bitmap.height;

  		var startUVX = bitmap.x / imageWidth;
  		var endUVX = startUVX + bitmap.width / imageWidth;
  		var startUVY = 1 - bitmap.y / imageHeight;
  		var endUVY = 1 - (bitmap.y + bitmap.height) / imageHeight;

  		vertices.push(startX, startY, endX, startY, endX, endY, startX, endY);
  		uvs.push(startUVX, startUVY, endUVX, startUVY, endUVX, endUVY, startUVX, endUVY);
  		var lastIndex = 4 * index;
  		indices.push(0 + lastIndex, 2 + lastIndex, 1 + lastIndex, 0 + lastIndex, 3 + lastIndex, 2 + lastIndex);
  	});

  	this.vertices = new Float32Array(vertices);
  	this.uvs = new Float32Array(uvs);
  	this.indices = new Uint16Array(indices);
  };

  exports.TextRendering = TextRendering;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
