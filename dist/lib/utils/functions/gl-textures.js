"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../common/constants");
/**
 *
 * @param gl
 * @param textureWidth
 * @param textureHeight
 * @param format
 * @param minFilter
 * @param magFilter
 * @param wrapS
 * @param wrapT
 * @param type
 */
function createEmptyTexture(gl, textureWidth, textureHeight, format, minFilter, magFilter, wrapS, wrapT, type) {
    if (format === void 0) { format = constants_1.RGB; }
    if (minFilter === void 0) { minFilter = constants_1.LINEAR; }
    if (magFilter === void 0) { magFilter = constants_1.LINEAR; }
    if (wrapS === void 0) { wrapS = constants_1.CLAMP_TO_EDGE; }
    if (wrapT === void 0) { wrapT = constants_1.CLAMP_TO_EDGE; }
    if (type === void 0) { type = constants_1.UNSIGNED_BYTE; }
    var targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    // define size and format of level 0
    var level = 0;
    var border = 0;
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    gl.texImage2D(gl.TEXTURE_2D, level, format, textureWidth, textureHeight, 0, format, type, null);
    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    return targetTexture;
}
exports.createEmptyTexture = createEmptyTexture;
function createImageTexture(gl, canvasImage, format, isFlip, isMipmap) {
    if (format === void 0) { format = constants_1.RGB; }
    if (isFlip === void 0) { isFlip = false; }
    if (isMipmap === void 0) { isMipmap = false; }
    return createCustomTypeImageTexture(gl, canvasImage, format, gl.UNSIGNED_BYTE, isFlip, isMipmap);
}
exports.createImageTexture = createImageTexture;
function createCustomTypeImageTexture(gl, canvasImage, format, type, isFlip, isMipmap) {
    if (format === void 0) { format = constants_1.RGB; }
    if (isFlip === void 0) { isFlip = false; }
    if (isMipmap === void 0) { isMipmap = false; }
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isFlip ? 0 : 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, canvasImage);
    if (isPowerOf2(canvasImage.width) && isPowerOf2(canvasImage.height) && isMipmap) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return texture;
}
exports.createCustomTypeImageTexture = createCustomTypeImageTexture;
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}
/**
 *
 * @param gl
 * @param texture
 * @param image
 * @param format
 */
function updateImageTexture(gl, texture, image, format) {
    if (format === void 0) { format = constants_1.RGB; }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}
exports.updateImageTexture = updateImageTexture;
/**
 *
 * @param gl
 * @param texture
 * @param uniformLocation
 * @param textureNum
 */
function activeTexture(gl, texture, uniformLocation, textureNum) {
    if (textureNum === void 0) { textureNum = 0; }
    var activeTextureNum = gl.TEXTURE0 + textureNum;
    gl.activeTexture(activeTextureNum);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniformLocation, textureNum);
}
exports.activeTexture = activeTexture;
//# sourceMappingURL=gl-textures.js.map