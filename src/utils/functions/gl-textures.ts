import { RGB, UNSIGNED_BYTE, CLAMP_TO_EDGE, LINEAR } from '../common/constants';

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
export function createEmptyTexture(
	gl: WebGLRenderingContext,
	textureWidth: number,
	textureHeight: number,
	format: number = RGB,
	minFilter: number = LINEAR,
	magFilter: number = LINEAR,
	wrapS: number = CLAMP_TO_EDGE,
	wrapT: number = CLAMP_TO_EDGE,
	type: number = UNSIGNED_BYTE
) {
	const targetTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);

	// define size and format of level 0
	const level = 0;
	const border = 0;

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
	gl.texImage2D(gl.TEXTURE_2D, level, format, textureWidth, textureHeight, 0, format, type, null);

	// set the filtering so we don't need mips
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

	return targetTexture;
}

export function createImageTexture(
	gl: WebGLRenderingContext,
	image: HTMLImageElement,
	format: number = RGB,
	isFlip: boolean = false,
	isMipmap: boolean = false
) {
	const texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isFlip ? 0 : 1);
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

function isPowerOf2(value: number) {
	return (value & (value - 1)) === 0;
}

/**
 *
 * @param gl
 * @param texture
 * @param image
 * @param format
 */
export function updateImageTexture(
	gl: WebGLRenderingContext,
	texture: WebGLTexture,
	image: HTMLImageElement,
	format: number = RGB
) {
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

/**
 *
 * @param gl
 * @param texture
 * @param uniformLocation
 * @param textureNum
 */
export function activeTexture(
	gl: WebGLRenderingContext,
	texture: WebGLTexture,
	uniformLocation: WebGLUniformLocation,
	textureNum: number = 0
) {
	const activeTextureNum = gl.TEXTURE0 + textureNum;
	gl.activeTexture(activeTextureNum);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(uniformLocation, textureNum);
}
