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
  // https://github.com/Jam3/layout-bmfont-text

  var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
  var M_WIDTHS = ['m', 'w'];
  var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var TAB_ID = '\t'.charCodeAt(0);
  var SPACE_ID = ' '.charCodeAt(0);
  var ALIGN_LEFT = 0,
      ALIGN_CENTER = 1,
      ALIGN_RIGHT = 2;

  function number(num, def) {
  	return typeof num === 'number' ? num : typeof def === 'number' ? def : 0;
  }

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
  			// get lines
  			var lines = new TextLines(text, this.options.fontData, this.options.width, this.options.start, this.options.mode, this.options.letterSpacing).lines;
  			var minWidth = this.options.width || 0;
  			var maxLineWidth = lines.reduce(function (prev, line) {
  				return Math.max(prev, line.width, minWidth);
  			}, 0);

  			//clear glyphs
  			glyphs = [];

  			//the pen position
  			var x = 0;
  			var y = 0;
  			var lineHeight = number(this.options.lineHeight, fontData.common.lineHeight);
  			var baseline = fontData.common.base;
  			var descender = lineHeight - baseline;
  			var letterSpacing = this.options.letterSpacing || 0;
  			var height = lineHeight * lines.length - descender;
  			var align = this.getAlignType(this.options.align);

  			y -= height;

  			this.width = maxLineWidth;
  			this.height = height;
  			this.descender = lineHeight - baseline;
  			this.baseline = baseline;
  			this.xHeight = getXHeight(fontData);
  			this.capHeight = getCapHeight(fontData);
  			this.lineHeight = lineHeight;
  			this.ascender = lineHeight - descender - this.xHeight;

  			var self = this;
  			lines.forEach(function (line, lineIndex) {
  				var start = line.start;
  				var end = line.end;
  				var lineWidth = line.width;
  				var lastGlyph = void 0;

  				//for each glyph in that line...
  				for (var i = start; i < end; i++) {
  					var id = text.charCodeAt(i);
  					var glyph = self.getGlyph(fontData, id);

  					if (glyph) {
  						if (lastGlyph) x += getKerning(fontData, lastGlyph.id, glyph.id);

  						var tx = x;
  						if (align === ALIGN_CENTER) tx += (maxLineWidth - lineWidth) / 2;else if (align === ALIGN_RIGHT) tx += maxLineWidth - lineWidth;

  						glyphs.push({
  							position: [tx, y],
  							data: glyph,
  							index: i,
  							line: lineIndex
  						});

  						//move pen forward
  						x += glyph.xadvance + letterSpacing;
  						lastGlyph = glyph;
  					}
  				}

  				//move pen forward
  				y += lineHeight;
  				x = 0;
  			});

  			this.linesTotal = lines.length;
  			console.log(glyphs);
  			this.glyphs = glyphs;
  		}
  	}, {
  		key: 'getGlyph',
  		value: function getGlyph(font, id) {
  			var glyph = getGlyphById(font, id);
  			if (glyph) return glyph;else if (id === TAB_ID) return this._fallbackTabGlyph;else if (id === SPACE_ID) return this._fallbackSpaceGlyph;
  			return null;
  		}
  	}, {
  		key: 'getAlignType',
  		value: function getAlignType(align) {
  			if (align === 'center') return ALIGN_CENTER;else if (align === 'right') return ALIGN_RIGHT;
  			return ALIGN_LEFT;
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
  			var space = getGlyphById(fontData, SPACE_ID) || this.getMGlyph(fontData) || fontData.chars[0];

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
  					var result = this.measure(text, this.fontData, start, lineEnd, testWidth);
  					lines.push(result);
  				}

  				start = nextStart;
  			}

  			this.lines = lines;
  		}
  	}, {
  		key: 'idxOf',
  		value: function idxOf(text, chr, start, end) {
  			var idx = text.indexOf(chr, start);

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
  				glyph = getGlyphById(font, id);

  				// console.log(glyph);
  				if (glyph) {
  					var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
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
  	}]);
  	return TextLines;
  }();

  function getKerning(font, lastId, nextId) {
  	if (!font.kernings) return 0;

  	var kernings = font.kernings;
  	var firstId = kernings[lastId];
  	if (firstId) {
  		var kerningSpace = firstId[nextId];
  		if (kerningSpace) return kerningSpace;
  	}

  	return 0;
  }

  function getXHeight(font) {
  	for (var i = 0; i < X_HEIGHTS.length; i++) {
  		var id = X_HEIGHTS[i].charCodeAt(0);
  		var idx = findChar(font.chars, id);
  		if (idx >= 0) return font.chars[idx].height;
  	}
  	return 0;
  }

  function findChar(fontChars, value) {
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

  function getGlyphById(font, id) {
  	if (!font.chars) return null;

  	var glyphIdx = findChar(font.chars, id);

  	return font.chars[glyphIdx];
  }

  function getCapHeight(font) {
  	for (var i = 0; i < CAP_HEIGHTS.length; i++) {
  		var id = CAP_HEIGHTS[i].charCodeAt(0);
  		var idx = findChar(font.chars, id);
  		if (idx >= 0) return font.chars[idx].height;
  	}
  	return 0;
  }

  exports.TextLayout = TextLayout;
  exports.TextLines = TextLines;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
