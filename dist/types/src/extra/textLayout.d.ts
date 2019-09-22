export declare class TextLayout {
    private fontData;
    private options;
    private glyphs;
    private width;
    private height;
    private descender;
    private baseline;
    private xHeight;
    private capHeight;
    private lineHeight;
    private ascender;
    private linesTotal;
    private _fallbackTabGlyph;
    private _fallbackSpaceGlyph;
    private fallbackSpaceGlyph;
    private fallbackTabGlyph;
    constructor(data: any, text: any, options?: {});
    update(): void;
    getGlyph(font: any, id: any): any;
    getAlignType(align: string): 0 | 1 | 2;
    setupSpaceGlyphs(fontData: any): void;
    extendObject(objectData: {
        [index: string]: any;
    }, data: {
        [index: string]: any;
    }): {
        [index: string]: any;
    };
    findChar(objectValue: {
        [index: string]: any;
    }, value: any): string | -1;
    getMGlyph(fontData: any): any;
}
export declare class TextLines {
    private fontData;
    lines: any;
    constructor(text: any, fontData: any, width?: number, start?: number, mode?: string, letterSpacing?: number);
    greedy(text: any, start: any, end: any, width: number, mode: any): void;
    idxOf(text: any, chr: any, start: number, end: number): any;
    isWhitespace(chr: string): boolean;
    measure(text: any, fontData: any, start: any, end: any, width: any): {
        start: any;
        end: any;
        width: number;
    };
    computeMetrics(text: any, font: any, start: any, end: any, width: any, letterSpacing?: number): {
        start: any;
        end: any;
        width: number;
    };
}
