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
export class TextLayout {
	/**
	 *
	 *
	 * @param {*} data
	 * @param {*} text
	 * @param {*} options
	 * @param {Number} options.tabSize
	 */
	constructor(data, text, options = {}) {
		console.log(data);
		console.log(text);
		this.fontData = data;
		this.options = options;
		this.options.fontData = this.fontData;
		this.options.text = text;

		this.glyphs = [];

		this.update();
	}

	update() {
		this.options.tabSize = this.options.tabSize ? this.options.tabSize : 4;
		if (!this.options.fontData) console.error('must provide a valid bitmap font');

		let glyphs = this.glyphs;
		const text = this.options.text;
		const fontData = this.options.fontData;
		this.setupSpaceGlyphs(fontData);
		var lines = new TextLines(
			text,
			this.options.fontData,
			this.options.width,
			this.options.start,
			this.options.mode,
			this.options.letterSpacing
		);
	}

	setupSpaceGlyphs(fontData) {
		this.fallbackSpaceGlyph = null;
		this.fallbackTabGlyph = null;

		if (!fontData.chars || fontData.chars.length === 0) return;

		//try to get space glyph
		//then fall back to the 'm' or 'w' glyphs
		//then fall back to the first glyph available
		console.log(fontData.chars[0]);
		const space =
			this.getGlyphById(fontData, SPACE_ID) || this.getMGlyph(fontData) || fontData.chars[0];

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

	extendObject(objectData, data) {
		let obj = {};
		for (let key in objectData) {
			obj[key] = objectData[key];
		}

		for (let key in data) {
			obj[key] = data[key];
		}

		return obj;
	}

	getGlyphById(fontData, id) {
		if (!fontData.chars || fontData.chars.length === 0) return null;

		var glyphIdx = this.findChar(fontData.chars, id);
		if (glyphIdx >= 0) return fontData.chars[glyphIdx];
		return null;
	}

	findChar(objectValue, value) {
		for (let key in objectValue) {
			if (objectValue[key].id === value) {
				return key;
			}
		}

		return -1;
	}

	getMGlyph(fontData) {
		console.log('getMGlyph');
		for (var i = 0; i < M_WIDTHS.length; i++) {
			var id = M_WIDTHS[i].charCodeAt(0);
			var idx = this.findChar(fontData.chars, id);
			if (idx >= 0) return fontData.chars[idx];
		}
		return 0;
	}
}

const newline = /\n/;
const newlineChar = '\n';
const whitespace = /\s/;

export class TextLines {
	constructor(
		text,
		fontData,
		width = Number.MAX_VALUE,
		start = 0,
		mode = 'nowrap',
		letterSpacing = 0
	) {
		// if(mode === )
		let end = text.length;
		this.fontData = fontData;
		this.greedy(text, start, end, width, mode);
		// this.measure(text, fontData, start, end, width,  );
	}

	greedy(text, start, end, width, mode) {
		//A greedy word wrapper based on LibGDX algorithm
		//https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java

		var lines = [];

		var testWidth = width;

		if (mode === 'nowrap') testWidth = Number.MAX_VALUE;

		while (start < end && start < text.length) {
			//get next newline position

			let newLine = this.idxOf(text, newlineChar, start, end);

			//eat whitespace at start of line
			while (start < newLine) {
				if (!this.isWhitespace(text.charAt(start))) break;
				start++;
			}

			//determine visible # of glyphs for the available width
			let measured = this.measure(text, this.fontData, start, newLine, testWidth);

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

		this.lines = lines;
	}

	idxOf(text, chr, start, end) {
		var idx = text.indexOf(chr, start);
		console.log('idxOf');
		console.log(start);
		console.log(text, chr, start);
		console.log(idx);
		if (idx === -1 || idx > end) return end;
		return idx;
	}

	isWhitespace(chr) {
		return whitespace.test(chr);
	}

	measure(text, fontData, start, end, width) {
		return this.computeMetrics(text, fontData, start, end, width);
	}

	computeMetrics(text, font, start, end, width, letterSpacing = 0) {
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
				let xoff = glyph.xoffset;
				let kern = lastGlyph ? this.getKerning(font, lastGlyph.id, glyph.id) : 0;
				curPen += kern;

				let nextPen = curPen + glyph.xadvance + letterSpacing;
				let nextWidth = curPen + glyph.width;
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

	getGlyphById(font, id) {
		if (!font.chars) return null;

		let glyphIdx = this.findChar(font.chars, id);

		return font.chars[glyphIdx];
	}

	findChar(fontChars, value) {
		// start = start || 0;
		// for (var i = start; i < array.length; i++) {
		for (let key in fontChars) {
			if (fontChars[key].id === value) {
				return key;
			}
		}
		// }
		return -1;
	}

	getKerning(font, lastId, nextId) {
		if (!font.kernings) return 0;

		let kernings = font.kernings;
		let firstId = kernings[lastId];
		if (firstId) {
			let kerningSpace = firstId[nextId];
			if (kerningSpace) return kerningSpace;
		}

		return 0;
	}
}
