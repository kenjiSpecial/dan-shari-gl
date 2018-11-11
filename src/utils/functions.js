/**
 * get uniform locations
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {Array} arr
 *
 * @returns {object} uniformLocation
 */
function getUniformLocations(gl, program, arr) {
	let locations = {};

	for (let ii = 0; ii < arr.length; ii++) {
		let name = arr[ii];
		let uniformLocation = gl.getUniformLocation(program, name);
		locations[name] = uniformLocation;
	}

	return uniformLocation;
}

/**
 * compile shader based on three.js
 */

function addLineNumbers(string) {
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
	const fragmentShader = compileGLShader(gl, gl.VERTEX_SHADER, fragmentShaderSrc);

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
