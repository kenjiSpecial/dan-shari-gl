import { FLOAT } from './consts';

/**
 * get uniform locations
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {Array} arr
 *
 * @returns {object} uniformLocation
 */
export function getUniformLocations(gl, program, arr) {
	let locations = {};

	for (let ii = 0; ii < arr.length; ii++) {
		let name = arr[ii];
		let uniformLocation = gl.getUniformLocation(program, name);
		locations[name] = uniformLocation;
	}

	return locations;
}

/**
 * compile shader based on three.js
 */

export function addLineNumbers(string) {
	let lines = string.split('\n');

	for (let i = 0; i < lines.length; i++) {
		lines[i] = i + 1 + ': ' + lines[i];
	}

	return lines.join('\n');
}

/**
 * compile webgl shader
 *
 * @param {WebGLRenderingContext} gl
 * @param {*} type
 * @param {*} shaderSource
 */
export function compileGLShader(gl, type, shaderSource) {
	let shader = gl.createShader(type);

	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	} else {
		console.error("[WebGLShader]: Shader couldn't compile.");

		if (gl.getShaderInfoLog(shader) !== '') {
			console.warn(
				'[WebGLShader]: gl.getShaderInfoLog()',
				type === gl.VERTEX_SHADER ? 'vertex' : 'fragment',
				gl.getShaderInfoLog(shader),
				addLineNumbers(shaderSource)
			);

			return null;
		}
	}
}

/**
 * create program
 *
 * @param {WebGLRenderingContext} gl
 * @param {String} vertxShaderSrc
 * @param {String} fragmentShaderSrc
 *
 * @returns {WebGLProgram} program
 */
export function createPrgoram(gl, vertexShaderSrc, fragmentShaderSrc) {
	const program = gl.createProgram();

	const vertexShader = compileGLShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
	const fragmentShader = compileGLShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	try {
		let success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!success) throw gl.getProgramInfoLog(program);
	} catch (error) {
		console.error(`WebGLProgram: ${error}`);
	}

	return program;
}

/**
 * get uniform locations
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {Float32Array} data
 * @param {String} str
 *
 * @returns {object} uniformLocation
 */
export function creteBuffer(gl, program, data, str) {
	const buffer = gl.createBuffer();
	const location = gl.getAttribLocation(program, str);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	return { buffer, location };
}

/**
 * get uniform locations
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {Uint16Array | Uint32Array} data
 * @param {String} str
 *
 * @returns {object} uniformLocation
 */
export function createIndex(gl, indices) {
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
	gl,
	buffer,
	location = 0,
	size = 1,
	type = FLOAT,
	normalized = false,
	stride = 0,
	offset = 0
) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
	gl.enableVertexAttribArray(location);
}
