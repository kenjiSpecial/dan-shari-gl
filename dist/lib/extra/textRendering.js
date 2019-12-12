"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextRendering = /** @class */ (function () {
    function TextRendering(gl, textLayout, bitmapImage) {
        var vertices = [];
        var uvs = [];
        var indices = [];
        var imageWidth = bitmapImage.width;
        var imageHeight = bitmapImage.height;
        textLayout.glyphs.forEach(function (glyph, index) {
            var bitmap = glyph.data;
            var _a = glyph.position, xx = _a[0], yy = _a[1];
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
    }
    return TextRendering;
}());
exports.TextRendering = TextRendering;
//# sourceMappingURL=textRendering.js.map