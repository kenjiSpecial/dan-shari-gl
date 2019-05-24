import { FLOAT } from '../common/constants';
import { vec2, vec3, mat4 } from 'gl-matrix';
import { Camera } from '../../camera/camera';

interface IUniformObject {
	[key: string]: WebGLUniformLocation;
}

export function getUniformLocations(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	arr: string[]
): IUniformObject {
	const locations: IUniformObject = {};

	// for (let ii = 0; ii < arr.length; ii++) {
	for (const name of arr) {
		const uniformLocation: WebGLUniformLocation = gl.getUniformLocation(
			program,
			name
		) as WebGLUniformLocation;
		locations[name] = uniformLocation;
	}

	return locations;
}

/**
 * display error of shader.
 * @param text
 */
export function addLineNumbers(text: string) {
	const lines = text.split('\n');

	for (let ii = 0; ii < lines.length; ii = ii + 1) {
		lines[ii] = `${ii + 1}: ${lines[ii]}`;
	}

	return lines.join('\n');
}

/**
 * compile webgl shader
 * @param gl
 * @param glType
 * @param shaderSource
 */
export function compileGLShader(gl: WebGLRenderingContext, glType: number, shaderSource: string) {
	const shader = gl.createShader(glType) as WebGLShader;

	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	} else {
		console.warn("[WebGLShader]: Shader couldn't compile.1");

		if (gl.getShaderInfoLog(shader) !== '') {
			console.warn(
				'[WebGLShader]: gl.getShaderInfoLog()',
				glType === gl.VERTEX_SHADER ? 'vertex' : 'fragment',
				gl.getShaderInfoLog(shader),
				addLineNumbers(shaderSource)
			);

			return undefined;
		}
	}
}

/**
 *
 * @param gl
 * @param vertexShaderSrc
 * @param fragmentShaderSrc
 */
export function createProgram(
	gl: WebGLRenderingContext,
	vertexShaderSrc: string,
	fragmentShaderSrc: string
): WebGLProgram {
	const program = gl.createProgram() as WebGLProgram;

	const vertexShader = compileGLShader(gl, gl.VERTEX_SHADER, vertexShaderSrc) as WebGLShader;
	const fragmentShader = compileGLShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentShaderSrc
	) as WebGLShader;

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	try {
		const success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!success) {
			throw gl.getProgramInfoLog(program);
		}
	} catch (error) {
		console.warn(`WebGLProgram: ${error}`);
	}

	return program;
}

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
export function createBufferWithLocation(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	data: Float32Array,
	str: string
) {
	const buffer = gl.createBuffer();
	const location = gl.getAttribLocation(program, str);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	return { buffer, location };
}

/**
 *
 * @param gl
 * @param data
 */
export function createBuffer(gl: WebGLRenderingContext, data: Float32Array) {
	const buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	return buffer;
}

/**
 *
 * make  index buffer
 *
 * @param gl
 * @param indices
 */
export function createIndex(gl: WebGLRenderingContext, indices: Uint16Array | Uint32Array) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	const cnt = indices.length;

	return { cnt, buffer };
}

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
export function bindBuffer(
	gl: WebGLRenderingContext,
	buffer: WebGLBuffer,
	location: number = 0,
	size: number = 1,
	type: number = FLOAT,
	normalized: boolean = false,
	stride: number = 0,
	offset: number = 0
) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
	gl.enableVertexAttribArray(location);
}

export function generateFaceFromIndex(vertices: number[], indices: number[]) {
	const faces: [vec3, vec3, vec3][] = [];

	for (let ii = 0; ii < indices.length; ii = ii + 3) {
		let index0 = indices[ii];
		let index1 = indices[ii + 1];
		let index2 = indices[ii + 2];

		faces.push([
			vec3.fromValues(
				vertices[3 * index0],
				vertices[3 * index0 + 1],
				vertices[3 * index0 + 2]
			),
			vec3.fromValues(
				vertices[3 * index1],
				vertices[3 * index1 + 1],
				vertices[3 * index1 + 2]
			),
			vec3.fromValues(
				vertices[3 * index2],
				vertices[3 * index2 + 1],
				vertices[3 * index2 + 2]
			)
		]);
	}

	return faces;
}

export function castMouse(
	mouse: vec2,
	viewMatrixInverse: mat4,
	projectionMatrixInverse: mat4,
	depth: number = 0
) {
	const clipSpace = vec3.fromValues(mouse[0], mouse[1], depth);
	const cameraSpace = vec3.create();
	const worldSpace = vec3.create();

	vec3.transformMat4(cameraSpace, clipSpace, projectionMatrixInverse);
	vec3.transformMat4(worldSpace, cameraSpace, viewMatrixInverse);

	return worldSpace;
}
