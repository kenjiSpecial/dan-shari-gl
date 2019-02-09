interface IUniformObject {
    [key: string]: WebGLUniformLocation;
}
export declare function getUniformLocations(gl: WebGLRenderingContext, program: WebGLProgram, arr: []): IUniformObject;
/**
 * display error of shader.
 * @param text
 */
export declare function addLineNumbers(text: string): string;
/**
 * compile webgl shader
 * @param gl
 * @param glType
 * @param shaderSource
 */
export declare function compileGLShader(gl: WebGLRenderingContext, glType: number, shaderSource: string): WebGLShader | undefined;
/**
 *
 * @param gl
 * @param vertexShaderSrc
 * @param fragmentShaderSrc
 */
export declare function createProgram(gl: WebGLRenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string): WebGLProgram;
/**
 *
 * create buffer and get location from program
 *
 * @param gl
 * @param program
 * @param data
 * @param str
 *
 * @returns uniformLocation
 */
export declare function createBufferWithLocation(gl: WebGLRenderingContext, program: WebGLProgram, data: Float32Array, str: string): {
    buffer: WebGLBuffer | null;
    location: number;
};
/**
 *
 * @param gl
 * @param data
 */
export declare function createBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer | null;
/**
 *
 * make  index buffer
 *
 * @param gl
 * @param indices
 */
export declare function createIndex(gl: WebGLRenderingContext, indices: Uint16Array | Uint32Array): {
    cnt: number;
    buffer: WebGLBuffer | null;
};
/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLBuffer} buffer
 * @param {Number} location
 * @param {Number} size
 * @param {Boolean} normalized
 * @param {Number} stride
 * @param {Number} offset
 */
export declare function bindBuffer(gl: WebGLRenderingContext, buffer: WebGLBuffer, location?: number, size?: number, type?: number, normalized?: boolean, stride?: number, offset?: number): void;
export {};
