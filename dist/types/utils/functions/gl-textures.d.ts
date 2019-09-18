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
export declare function createEmptyTexture(gl: WebGLRenderingContext, textureWidth: number, textureHeight: number, format?: number, minFilter?: number, magFilter?: number, wrapS?: number, wrapT?: number, type?: number): WebGLTexture | null;
export declare function createImageTexture(gl: WebGLRenderingContext, canvasImage: HTMLImageElement | HTMLCanvasElement, format?: number, isFlip?: boolean, isMipmap?: boolean): WebGLTexture | null;
export declare function createCustomTypeImageTexture(gl: WebGLRenderingContext, canvasImage: HTMLImageElement | HTMLCanvasElement, format: number | undefined, type: number, isFlip?: boolean, isMipmap?: boolean): WebGLTexture | null;
/**
 *
 * @param gl
 * @param texture
 * @param image
 * @param format
 */
export declare function updateImageTexture(gl: WebGLRenderingContext, texture: WebGLTexture, image: HTMLImageElement, format?: number): void;
/**
 *
 * @param gl
 * @param texture
 * @param uniformLocation
 * @param textureNum
 */
export declare function activeTexture(gl: WebGLRenderingContext, texture: WebGLTexture, uniformLocation: WebGLUniformLocation, textureNum?: number): void;
