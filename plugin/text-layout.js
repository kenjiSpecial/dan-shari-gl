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
		// get lines
		const lines = new TextLines(
			text,
			this.options.fontData,
			this.options.width,
			this.options.start,
			this.options.mode,
			this.options.letterSpacing
		).lines;
		let minWidth = this.options.width || 0;
		let maxLineWidth = lines.reduce(function(prev, line) {
			return Math.max(prev, line.width, minWidth);
		}, 0);

		//clear glyphs
		glyphs = [];

		//the pen position
		let x = 0;
		let y = 0;
		const lineHeight = number(this.options.lineHeight, fontData.common.lineHeight);
		const baseline = fontData.common.base;
		const descender = lineHeight - baseline;
		const letterSpacing = this.options.letterSpacing || 0;
		const height = lineHeight * lines.length - descender;
		const align = this.getAlignType(this.options.align);

		y -= height;

		this.width = maxLineWidth;
		this.height = height;
		this.descender = lineHeight - baseline;
		this.baseline = baseline;
		this.xHeight = getXHeight(fontData);
		this.capHeight = getCapHeight(fontData);
		this.lineHeight = lineHeight;
		this.ascender = lineHeight - descender - this.xHeight;

		let self = this;
		lines.forEach(function(line, lineIndex) {
			let start = line.start;
			let end = line.end;
			let lineWidth = line.width;
			let lastGlyph;

			//for each glyph in that line...
			for (var i = start; i < end; i++) {
				var id = text.charCodeAt(i);
				var glyph = self.getGlyph(fontData, id);

				if (glyph) {
					if (lastGlyph) x += getKerning(fontData, lastGlyph.id, glyph.id);

					var tx = x;
					if (align === ALIGN_CENTER) tx += (maxLineWidth - lineWidth) / 2;
					else if (align === ALIGN_RIGHT) tx += maxLineWidth - lineWidth;

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

	getGlyph(font, id) {
		var glyph = getGlyphById(font, id);
		if (glyph) return glyph;
		else if (id === TAB_ID) return this._fallbackTabGlyph;
		else if (id === SPACE_ID) return this._fallbackSpaceGlyph;
		return null;
	}

	getAlignType(align) {
		if (align === 'center') return ALIGN_CENTER;
		else if (align === 'right') return ALIGN_RIGHT;
		return ALIGN_LEFT;
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
			getGlyphById(fontData, SPACE_ID) || this.getMGlyph(fontData) || fontData.chars[0];

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
				var result = this.measure(text, this.fontData, start, lineEnd, testWidth);
				lines.push(result);
			}

			start = nextStart;
		}

		this.lines = lines;
	}

	idxOf(text, chr, start, end) {
		var idx = text.indexOf(chr, start);

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
			glyph = getGlyphById(font, id);

			// console.log(glyph);
			if (glyph) {
				let kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
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
}

function getKerning(font, lastId, nextId) {
	if (!font.kernings) return 0;

	let kernings = font.kernings;
	let firstId = kernings[lastId];
	if (firstId) {
		let kerningSpace = firstId[nextId];
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
	for (let key in fontChars) {
		if (fontChars[key].id === value) {
			return key;
		}
	}
	// }
	return -1;
}

function getGlyphById(font, id) {
	if (!font.chars) return null;

	let glyphIdx = findChar(font.chars, id);

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
