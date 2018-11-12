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

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  // convert layout-bmfont-text into layout
  var M_WIDTHS = ['m', 'w'];
  var TAB_ID = '\t'.charCodeAt(0);
  var SPACE_ID = ' '.charCodeAt(0);
  var TextLayout = function () {
  	/**
    *
    *
    * @param {*} data
    * @param {*} text
    * @param {*} options
    * @param {Number} options.tabSize
    */
  	function TextLayout(data, text) {
  		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  		classCallCheck(this, TextLayout);

  		console.log(data);
  		console.log(text);
  		this.fontData = data;
  		this.options = options;
  		this.options.fontData = this.fontData;
  		this.options.text = text;

  		this.glyphs = [];

  		this.update();
  	}

  	createClass(TextLayout, [{
  		key: 'update',
  		value: function update() {
  			this.options.tabSize = this.options.tabSize ? this.options.tabSize : 4;
  			if (!this.options.fontData) console.error('must provide a valid bitmap font');

  			var glyphs = this.glyphs;
  			var text = this.options.text;
  			var fontData = this.options.fontData;
  			this.setupSpaceGlyphs(fontData);
  			var lines = new TextLines(text, this.options.fontData, this.options.width, this.options.start, this.options.mode, this.options.letterSpacing);
  		}
  	}, {
  		key: 'setupSpaceGlyphs',
  		value: function setupSpaceGlyphs(fontData) {
  			this.fallbackSpaceGlyph = null;
  			this.fallbackTabGlyph = null;

  			if (!fontData.chars || fontData.chars.length === 0) return;

  			//try to get space glyph
  			//then fall back to the 'm' or 'w' glyphs
  			//then fall back to the first glyph available
  			console.log(fontData.chars[0]);
  			var space = this.getGlyphById(fontData, SPACE_ID) || this.getMGlyph(fontData) || fontData.chars[0];

  			console.log(space);
  			var tabWidth = this.options.tabSize * space.xadvance;
  			this.fallbackSpaceGlyph = space;
  			this.fallbackTabGlyph = this.extendObject(space, {
  				x: 0,
  				y: 0,
  				xadvance: tabWidth,
  				id: TAB_ID,
  				xoffset: 0,
  				yoffset: 0,
  				width: 0,
  				height: 0
  			});
  		}
  	}, {
  		key: 'extendObject',
  		value: function extendObject(objectData, data) {
  			var obj = {};
  			for (var key in objectData) {
  				obj[key] = objectData[key];
  			}

  			for (var _key in data) {
  				obj[_key] = data[_key];
  			}

  			return obj;
  		}
  	}, {
  		key: 'getGlyphById',
  		value: function getGlyphById(fontData, id) {
  			if (!fontData.chars || fontData.chars.length === 0) return null;

  			var glyphIdx = this.findChar(fontData.chars, id);
  			if (glyphIdx >= 0) return fontData.chars[glyphIdx];
  			return null;
  		}
  	}, {
  		key: 'findChar',
  		value: function findChar(objectValue, value) {
  			for (var key in objectValue) {
  				if (objectValue[key].id === value) {
  					return key;
  				}
  			}

  			return -1;
  		}
  	}, {
  		key: 'getMGlyph',
  		value: function getMGlyph(fontData) {
  			console.log('getMGlyph');
  			for (var i = 0; i < M_WIDTHS.length; i++) {
  				var id = M_WIDTHS[i].charCodeAt(0);
  				var idx = this.findChar(fontData.chars, id);
  				if (idx >= 0) return fontData.chars[idx];
  			}
  			return 0;
  		}
  	}]);
  	return TextLayout;
  }();
  var newlineChar = '\n';
  var whitespace = /\s/;

  var TextLines = function () {
  	function TextLines(text, fontData) {
  		var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Number.MAX_VALUE;
  		var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  		var mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'nowrap';
  		classCallCheck(this, TextLines);

  		// if(mode === )
  		var end = text.length;
  		this.fontData = fontData;
  		this.greedy(text, start, end, width, mode);
  		// this.measure(text, fontData, start, end, width,  );
  	}

  	createClass(TextLines, [{
  		key: 'greedy',
  		value: function greedy(text, start, end, width, mode) {
  			//A greedy word wrapper based on LibGDX algorithm
  			//https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java

  			var lines = [];

  			var testWidth = width;

  			if (mode === 'nowrap') testWidth = Number.MAX_VALUE;
  			width = 100;

  			while (start < end && start < text.length) {
  				//get next newline position

  				var newLine = this.idxOf(text, newlineChar, start, end);

  				//eat whitespace at start of line
  				while (start < newLine) {
  					if (!this.isWhitespace(text.charAt(start))) break;
  					start++;
  				}

  				//determine visible # of glyphs for the available width
  				var measured = this.measure(text, this.fontData, start, newLine, testWidth);

  				var lineEnd = start + (measured.end - measured.start);
  				var nextStart = lineEnd + newlineChar.length;

  				//if we had to cut the line before the next newline...
  				if (lineEnd < newLine) {
  					//find char to break on
  					while (lineEnd > start) {
  						if (this.isWhitespace(text.charAt(lineEnd))) break;
  						lineEnd--;
  					}
  					if (lineEnd === start) {
  						if (nextStart > start + newlineChar.length) nextStart--;
  						lineEnd = nextStart; // If no characters to break, show all.
  					} else {
  						nextStart = lineEnd;
  						//eat whitespace at end of line
  						while (lineEnd > start) {
  							if (!this.isWhitespace(text.charAt(lineEnd - newlineChar.length))) break;
  							lineEnd--;
  						}
  					}
  				}
  				if (lineEnd >= start) {
  					var result = this.measure(text, start, lineEnd, testWidth);
  					lines.push(result);
  				}

  				start = nextStart;
  			}

  			return lines;
  		}
  	}, {
  		key: 'idxOf',
  		value: function idxOf(text, chr, start, end) {
  			var idx = text.indexOf(chr, start);
  			console.log('idxOf');
  			console.log(start);
  			console.log(text, chr, start);
  			console.log(idx);
  			if (idx === -1 || idx > end) return end;
  			return idx;
  		}
  	}, {
  		key: 'isWhitespace',
  		value: function isWhitespace(chr) {
  			return whitespace.test(chr);
  		}
  	}, {
  		key: 'measure',
  		value: function measure(text, fontData, start, end, width) {
  			return this.computeMetrics(text, fontData, start, end, width);
  		}
  	}, {
  		key: 'computeMetrics',
  		value: function computeMetrics(text, font, start, end, width) {
  			var letterSpacing = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  			var curPen = 0;
  			var curWidth = 0;
  			var count = 0;
  			var glyph;
  			var lastGlyph;

  			if (!font.chars) {
  				return {
  					start: start,
  					end: start,
  					width: 0
  				};
  			}

  			end = Math.min(text.length, end);

  			for (var i = start; i < end; i++) {
  				var id = text.charCodeAt(i);
  				var glyph = this.getGlyphById(font, id);

  				// console.log(glyph);
  				if (glyph) {
  					var xoff = glyph.xoffset;
  					var kern = lastGlyph ? this.getKerning(font, lastGlyph.id, glyph.id) : 0;
  					curPen += kern;

  					var nextPen = curPen + glyph.xadvance + letterSpacing;
  					var nextWidth = curPen + glyph.width;
  					//we've hit our limit; we can't move onto the next glyph
  					if (nextWidth >= width || nextPen >= width) break;

  					//otherwise continue along our line
  					curPen = nextPen;
  					curWidth = nextWidth;
  					lastGlyph = glyph;
  				}
  				count++;
  			}

  			if (lastGlyph) curWidth += lastGlyph.xoffset;

  			return {
  				start: start,
  				end: start + count,
  				width: curWidth
  			};
  		}
  	}, {
  		key: 'getGlyphById',
  		value: function getGlyphById(font, id) {
  			if (!font.chars) return null;

  			var glyphIdx = this.findChar(font.chars, id);

  			return font.chars[glyphIdx];
  		}
  	}, {
  		key: 'findChar',
  		value: function findChar(fontChars, value) {
  			// start = start || 0;
  			// for (var i = start; i < array.length; i++) {
  			for (var key in fontChars) {
  				if (fontChars[key].id === value) {
  					return key;
  				}
  			}
  			// }
  			return -1;
  		}
  	}, {
  		key: 'getKerning',
  		value: function getKerning(font, lastId, nextId) {
  			if (!font.kernings) return 0;

  			var kernings = font.kernings;
  			var firstId = kernings[lastId];
  			if (firstId) {
  				var kerningSpace = firstId[nextId];
  				if (kerningSpace) return kerningSpace;
  			}

  			return 0;
  		}
  	}]);
  	return TextLines;
  }();

  exports.TextLayout = TextLayout;
  exports.TextLines = TextLines;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
