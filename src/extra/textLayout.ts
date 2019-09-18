// convert layout-bmfont-text into layout
// https://github.com/Jam3/layout-bmfont-text

const X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
const M_WIDTHS = ['m', 'w'];
const CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const TAB_ID = '\t'.charCodeAt(0);
const SPACE_ID = ' '.charCodeAt(0);
const ALIGN_LEFT = 0;
const ALIGN_CENTER = 1;
const ALIGN_RIGHT = 2;

function number(num: any, def: any) {
	return typeof num === 'number' ? num : typeof def === 'number' ? def : 0;
}

export class TextLayout {
	private fontData: any;
	private options: any = {};
	private glyphs: any = [];
	private width: any;
	private height: any;
	private descender: any;
	private baseline: any;
	private xHeight: any;
	private capHeight: any;
	private lineHeight: any;
	private ascender: any;
	private linesTotal: any;
	private _fallbackTabGlyph: any;
	private _fallbackSpaceGlyph: any;
	private fallbackSpaceGlyph: any;
	private fallbackTabGlyph: any;
	constructor(data: any, text: any, options = {}) {
		this.fontData = data;
		this.options = options;
		this.options.fontData = this.fontData;
		this.options.text = text;

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
		let maxLineWidth = lines.reduce(function(prev: any, line: any) {
			return Math.max(prev, line.width, minWidth);
		}, 0);

		// clear glyphs
		glyphs = [];

		// the pen position
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
		lines.forEach(function(line: any, lineIndex: any) {
			let start = line.start;
			let end = line.end;
			let lineWidth = line.width;
			let lastGlyph;
			// for each glyph in that line...
			for (let i = start; i < end; i++) {
				let id = text.charCodeAt(i);
				let glyph = self.getGlyph(fontData, id);

				if (glyph) {
					if (lastGlyph) x += getKerning(fontData, lastGlyph.id, glyph.id);

					let tx = x;
					if (align === ALIGN_CENTER) tx += (maxLineWidth - lineWidth) / 2;
					else if (align === ALIGN_RIGHT) tx += maxLineWidth - lineWidth;

					glyphs.push({
						position: [tx, y],
						data: glyph,
						index: i,
						line: lineIndex
					});

					// move pen forward
					x += glyph.xadvance + letterSpacing;
					lastGlyph = glyph;
				}
			}

			// move pen forward
			y += lineHeight;
			x = 0;
		});

		this.linesTotal = lines.length;
		this.glyphs = glyphs;
	}

	getGlyph(font: any, id: any) {
		let glyph = getGlyphById(font, id);
		if (glyph) return glyph;
		else if (id === TAB_ID) return this._fallbackTabGlyph;
		else if (id === SPACE_ID) return this._fallbackSpaceGlyph;
		return null;
	}

	getAlignType(align: string) {
		if (align === 'center') return ALIGN_CENTER;
		else if (align === 'right') return ALIGN_RIGHT;
		return ALIGN_LEFT;
	}

	setupSpaceGlyphs(fontData: any) {
		this.fallbackSpaceGlyph = null;
		this.fallbackTabGlyph = null;

		if (!fontData.chars || fontData.chars.length === 0) return;

		// try to get space glyph
		// then fall back to the 'm' or 'w' glyphs
		// then fall back to the first glyph available
		const space =
			getGlyphById(fontData, SPACE_ID) || this.getMGlyph(fontData) || fontData.chars[0];

		let tabWidth = this.options.tabSize * space.xadvance;
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

	extendObject(objectData: { [index: string]: any }, data: { [index: string]: any }) {
		let obj: { [index: string]: any } = {};
		for (let key in objectData) {
			obj[key] = objectData[key];
		}

		for (let key in data) {
			obj[key] = data[key];
		}

		return obj;
	}

	findChar(objectValue: { [index: string]: any }, value: any) {
		for (let key in objectValue) {
			if (objectValue[key].id === value) {
				return key;
			}
		}

		return -1;
	}

	getMGlyph(fontData: any) {
		for (let i = 0; i < M_WIDTHS.length; i++) {
			let id = M_WIDTHS[i].charCodeAt(0);
			let idx = this.findChar(fontData.chars, id);
			if (idx >= 0) return fontData.chars[idx];
		}
		return 0;
	}
}

const newline = /\n/;
const newlineChar = '\n';
const whitespace = /\s/;

export class TextLines {
	private fontData: any;
	public lines: any;
	constructor(
		text: any,
		fontData: any,
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

	greedy(text: any, start: any, end: any, width: number, mode: any) {
		// A greedy word wrapper based on LibGDX algorithm
		// https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java

		let lines = [];

		let testWidth = width;

		if (mode === 'nowrap') testWidth = Number.MAX_VALUE;

		while (start < end && start < text.length) {
			// get next newline position

			let newLine = this.idxOf(text, newlineChar, start, end);

			// eat whitespace at start of line
			while (start < newLine) {
				if (!this.isWhitespace(text.charAt(start))) break;
				start++;
			}

			// determine visible # of glyphs for the available width
			let measured = this.measure(text, this.fontData, start, newLine, testWidth);

			let lineEnd = start + (measured.end - measured.start);
			let nextStart = lineEnd + newlineChar.length;

			// if we had to cut the line before the next newline...
			if (lineEnd < newLine) {
				// find char to break on
				while (lineEnd > start) {
					if (this.isWhitespace(text.charAt(lineEnd))) break;
					lineEnd--;
				}
				if (lineEnd === start) {
					if (nextStart > start + newlineChar.length) nextStart--;
					lineEnd = nextStart; // If no characters to break, show all.
				} else {
					nextStart = lineEnd;
					// eat whitespace at end of line
					while (lineEnd > start) {
						if (!this.isWhitespace(text.charAt(lineEnd - newlineChar.length))) break;
						lineEnd--;
					}
				}
			}

			if (lineEnd >= start) {
				let result = this.measure(text, this.fontData, start, lineEnd, testWidth);
				lines.push(result);
			}

			start = nextStart;
		}

		this.lines = lines;
	}

	idxOf(text: any, chr: any, start: number, end: number) {
		let idx = text.indexOf(chr, start);

		if (idx === -1 || idx > end) return end;
		return idx;
	}

	isWhitespace(chr: string) {
		return whitespace.test(chr);
	}

	measure(text: any, fontData: any, start: any, end: any, width: any) {
		return this.computeMetrics(text, fontData, start, end, width);
	}

	computeMetrics(text: any, font: any, start: any, end: any, width: any, letterSpacing = 0) {
		let curPen = 0;
		let curWidth = 0;
		let count = 0;
		let glyph;
		let lastGlyph;

		if (!font.chars) {
			return {
				start: start,
				end: start,
				width: 0
			};
		}

		end = Math.min(text.length, end);

		for (let i = start; i < end; i++) {
			let id = text.charCodeAt(i);
			glyph = getGlyphById(font, id);

			// console.log(glyph);
			if (glyph) {
				let kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
				curPen += kern;

				let nextPen = curPen + glyph.xadvance + letterSpacing;
				let nextWidth = curPen + glyph.width;
				// we've hit our limit; we can't move onto the next glyph
				if (nextWidth >= width || nextPen >= width) break;

				// otherwise continue along our line
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

function getKerning(font: any, lastId: any, nextId: any) {
	if (!font.kernings) return;

	let kernings = font.kernings;
	let firstId = kernings[lastId];
	if (firstId) {
		let kerningSpace = firstId[nextId];
		if (kerningSpace) return kerningSpace;
	}

	return 0;
}

function getXHeight(font: any) {
	for (let i = 0; i < X_HEIGHTS.length; i++) {
		let id = X_HEIGHTS[i].charCodeAt(0);
		let idx = findChar(font.chars, id);
		if (idx >= 0) return font.chars[idx].height;
	}
	return 0;
}

function findChar(fontChars: any, value: any) {
	for (let key in fontChars) {
		if (fontChars[key].id === value) {
			return key;
		}
	}
	return -1;
}

function getGlyphById(font: any, id: any) {
	if (!font.chars) return null;

	let glyphIdx = findChar(font.chars, id);

	return font.chars[glyphIdx];
}

function getCapHeight(font: any) {
	for (let i = 0; i < CAP_HEIGHTS.length; i++) {
		let id = CAP_HEIGHTS[i].charCodeAt(0);
		let idx = findChar(font.chars, id);
		if (idx >= 0) return font.chars[idx].height;
	}
	return 0;
}
