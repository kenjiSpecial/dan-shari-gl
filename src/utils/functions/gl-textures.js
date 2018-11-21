import { RGB, UNSIGNED_BYTE, CLAMP_TO_EDGE, LINEAR } from '../consts';

/**
 *
 * create empty texture
 *
 * @param {WebGLRenderingContext} gl
 * @param {*} targetTextureWidth
 * @param {*} targetTextureHeight
 */
export function createEmptyTexture(
	gl,
	textureWidth,
	textureHeight,
	format = RGB,
	minFilter = LINEAR,
	magFilter = LINEAR,
	wrapS = CLAMP_TO_EDGE,
	wrapT = CLAMP_TO_EDGE,
	type = UNSIGNED_BYTE
) {
	const targetTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);

	// define size and format of level 0
	const level = 0;
	const border = 0;
	// const type = gl.UNSIGNED_BYTE;
	const data = null;

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		format,
		textureWidth,
		textureHeight,
		data,
		format,
		type,
		data
	);

	// set the filtering so we don't need mips
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

	return targetTexture;
}

/**
 * create texture from image
 *
 * @param {WebGLRenderingContext} gl
 * @param {Image} image
 * @param {number} format
 * @param {Boolean} isFlip
 *
 */
export function createImageTexture(gl, image, format = RGB, isFlip = false, isMipmap = false) {
	let texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isFlip);
	gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image);

	if (isPowerOf2(image.width) && isPowerOf2(image.height) && isMipmap) {
		// Yes, it's a power of 2. Generate mips.
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		// No, it's not a power of 2. Turn of mips and set
		// wrapping to clamp to edge
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	return texture;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLTexture} texture
 * @param {Image} image
 * @param {number} format
 *
 */
export function updateImageTexture(gl, texture, image, format = RGB) {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image);

	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		// Yes, it's a power of 2. Generate mips.
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		// No, it's not a power of 2. Turn of mips and set
		// wrapping to clamp to edge
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLTexture} texture
 * @param {WebGLUniformLocation} uniformLocation
 * @param {number} textureNum
 */
export function activeTexture(gl, texture, uniformLocation, textureNum = 0) {
	let activeTextureNum = gl.TEXTURE0 + textureNum;
	gl.activeTexture(activeTextureNum);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(uniformLocation, textureNum);
}
