(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.dsr = {})));
}(this, (function (exports) { 'use strict';

	var FLOAT = 0x1406;

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
		var locations = {};

		for (var ii = 0; ii < arr.length; ii++) {
			var name = arr[ii];
			var uniformLocation = gl.getUniformLocation(program, name);
			locations[name] = uniformLocation;
		}

		return locations;
	}

	/**
	 * compile shader based on three.js
	 */

	function addLineNumbers(string) {
		var lines = string.split('\n');

		for (var i = 0; i < lines.length; i++) {
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
	function compileGLShader(gl, type, shaderSource) {
		var shader = gl.createShader(type);

		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return shader;
		} else {
			console.error("[WebGLShader]: Shader couldn't compile.");

			if (gl.getShaderInfoLog(shader) !== '') {
				console.warn('[WebGLShader]: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog(shader), addLineNumbers(shaderSource));

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
	function createPrgoram(gl, vertexShaderSrc, fragmentShaderSrc) {
		var program = gl.createProgram();

		var vertexShader = compileGLShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
		var fragmentShader = compileGLShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		try {
			var success = gl.getProgramParameter(program, gl.LINK_STATUS);
			if (!success) throw gl.getProgramInfoLog(program);
		} catch (error) {
			console.error('WebGLProgram: ' + error);
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
	function creteBuffer(gl, program, data, str) {
		var buffer = gl.createBuffer();
		var location = gl.getAttribLocation(program, str);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		return { buffer: buffer, location: location };
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
	function createIndex(gl, indices) {
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		var cnt = indices.length;
		return { cnt: cnt, buffer: buffer };
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
	function bindBuffer(gl, buffer) {
		var location = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
		var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : FLOAT;
		var normalized = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
		var stride = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
		var offset = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
		gl.enableVertexAttribArray(location);
	}

	function getSphere() {
		var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
		var latitudeBands = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 64;
		var longitudeBands = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 64;

		var vertices = [];
		var textures = [];
		var normals = [];
		var indices = [];

		for (var latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
			var theta = latNumber * Math.PI / latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);

			for (var longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
				var phi = longNumber * 2 * Math.PI / longitudeBands;
				var sinPhi = Math.sin(phi);
				var cosPhi = Math.cos(phi);

				var x = cosPhi * sinTheta;
				var y = cosTheta;
				var z = sinPhi * sinTheta;
				var u = 1 - longNumber / longitudeBands;
				var v = 1 - latNumber / latitudeBands;

				normals.push(x, y, z);
				textures.push(u, v);
				vertices.push(radius * x, radius * y, radius * z);
			}
		}

		for (latNumber = 0; latNumber < latitudeBands; ++latNumber) {
			for (longNumber = 0; longNumber < longitudeBands; ++longNumber) {
				var first = latNumber * (longitudeBands + 1) + longNumber;
				var second = first + longitudeBands + 1;
				indices.push(second, first, first + 1, second + 1, second, first + 1);
			}
		}

		return {
			vertices: vertices,
			textures: textures,
			normals: normals,
			indices: indices
		};
	}

	var EPSILON = 0.000001;
	var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
	var RANDOM = Math.random;

	var common = /*#__PURE__*/Object.freeze({
		EPSILON: EPSILON,
		ARRAY_TYPE: ARRAY_TYPE,
		RANDOM: RANDOM
	});

	function create() {
		var out = new ARRAY_TYPE(16);
		if (ARRAY_TYPE != Float32Array) {
			out[1] = 0;
			out[2] = 0;
			out[3] = 0;
			out[4] = 0;
			out[6] = 0;
			out[7] = 0;
			out[8] = 0;
			out[9] = 0;
			out[11] = 0;
			out[12] = 0;
			out[13] = 0;
			out[14] = 0;
		}
		out[0] = 1;
		out[5] = 1;
		out[10] = 1;
		out[15] = 1;
		return out;
	}

	function multiply(out, a, b) {
		var a00 = a[0],
		    a01 = a[1],
		    a02 = a[2],
		    a03 = a[3];
		var a10 = a[4],
		    a11 = a[5],
		    a12 = a[6],
		    a13 = a[7];
		var a20 = a[8],
		    a21 = a[9],
		    a22 = a[10],
		    a23 = a[11];
		var a30 = a[12],
		    a31 = a[13],
		    a32 = a[14],
		    a33 = a[15];
		// Cache only the current line of the second matrix
		var b0 = b[0],
		    b1 = b[1],
		    b2 = b[2],
		    b3 = b[3];
		out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[4];
		b1 = b[5];
		b2 = b[6];
		b3 = b[7];
		out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[8];
		b1 = b[9];
		b2 = b[10];
		b3 = b[11];
		out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		b0 = b[12];
		b1 = b[13];
		b2 = b[14];
		b3 = b[15];
		out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		return out;
	}

	function perspective(out, fovy, aspect, near, far) {
		var f = 1.0 / Math.tan(fovy / 2),
		    nf = void 0;
		out[0] = f / aspect;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = f;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[11] = -1;
		out[12] = 0;
		out[13] = 0;
		out[15] = 0;
		if (far != null && far !== Infinity) {
			nf = 1 / (near - far);
			out[10] = (far + near) * nf;
			out[14] = 2 * far * near * nf;
		} else {
			out[10] = -1;
			out[14] = -2 * near;
		}
		return out;
	}

	function identity(out) {
		out[0] = 1;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = 1;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = 1;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;
		return out;
	}

	function clone(mat) {
		var out = new ARRAY_TYPE(16);
		for (var ii = 0; ii < out.length; ii++) {
			out[ii] = mat[ii];
		}

		return out;
	}

	function fromTranslation(out, v) {
		out[0] = 1;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = 1;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = 1;
		out[11] = 0;
		out[12] = v[0];
		out[13] = v[1];
		out[14] = v[2];
		out[15] = 1;
		return out;
	}

	function fromYRotation(out, rad) {
		var s = Math.sin(rad);
		var c = Math.cos(rad);
		// Perform axis-specific matrix multiplication

		out[0] = c;
		out[1] = 0;
		out[2] = -s;
		out[3] = 0;
		out[4] = 0;
		out[5] = 1;
		out[6] = 0;
		out[7] = 0;
		out[8] = s;
		out[9] = 0;
		out[10] = c;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;

		return out;
	}

	function lookAt(out, eye, center, up) {
		var x0 = void 0,
		    x1 = void 0,
		    x2 = void 0,
		    y0 = void 0,
		    y1 = void 0,
		    y2 = void 0,
		    z0 = void 0,
		    z1 = void 0,
		    z2 = void 0,
		    len = void 0;
		var eyex = eye[0];
		var eyey = eye[1];
		var eyez = eye[2];
		var upx = up[0];
		var upy = up[1];
		var upz = up[2];
		var centerx = center[0];
		var centery = center[1];
		var centerz = center[2];

		if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
			return identity(out);
		}

		z0 = eyex - centerx;
		z1 = eyey - centery;
		z2 = eyez - centerz;

		len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
		z0 *= len;
		z1 *= len;
		z2 *= len;

		x0 = upy * z2 - upz * z1;
		x1 = upz * z0 - upx * z2;
		x2 = upx * z1 - upy * z0;
		len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
		if (!len) {
			x0 = 0;
			x1 = 0;
			x2 = 0;
		} else {
			len = 1 / len;
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}

		y0 = z1 * x2 - z2 * x1;
		y1 = z2 * x0 - z0 * x2;
		y2 = z0 * x1 - z1 * x0;

		len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
		if (!len) {
			y0 = 0;
			y1 = 0;
			y2 = 0;
		} else {
			len = 1 / len;
			y0 *= len;
			y1 *= len;
			y2 *= len;
		}

		out[0] = x0;
		out[1] = y0;
		out[2] = z0;
		out[3] = 0;
		out[4] = x1;
		out[5] = y1;
		out[6] = z1;
		out[7] = 0;
		out[8] = x2;
		out[9] = y2;
		out[10] = z2;
		out[11] = 0;
		out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
		out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
		out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
		out[15] = 1;

		return out;
	}

	function fromRotationTranslationScale(out, q, v, s) {
		// Quaternion math
		var x = q[0],
		    y = q[1],
		    z = q[2],
		    w = q[3];
		var x2 = x + x;
		var y2 = y + y;
		var z2 = z + z;
		var xx = x * x2;
		var xy = x * y2;
		var xz = x * z2;
		var yy = y * y2;
		var yz = y * z2;
		var zz = z * z2;
		var wx = w * x2;
		var wy = w * y2;
		var wz = w * z2;
		var sx = s[0];
		var sy = s[1];
		var sz = s[2];
		out[0] = (1 - (yy + zz)) * sx;
		out[1] = (xy + wz) * sx;
		out[2] = (xz - wy) * sx;
		out[3] = 0;
		out[4] = (xy - wz) * sy;
		out[5] = (1 - (xx + zz)) * sy;
		out[6] = (yz + wx) * sy;
		out[7] = 0;
		out[8] = (xz + wy) * sz;
		out[9] = (yz - wx) * sz;
		out[10] = (1 - (xx + yy)) * sz;
		out[11] = 0;
		out[12] = v[0];
		out[13] = v[1];
		out[14] = v[2];
		out[15] = 1;
		return out;
	}

	function fromXRotation(out, rad) {
		var s = Math.sin(rad);
		var c = Math.cos(rad);
		// Perform axis-specific matrix multiplication
		out[0] = 1;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = c;
		out[6] = s;
		out[7] = 0;
		out[8] = 0;
		out[9] = -s;
		out[10] = c;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;
		return out;
	}

	function targetTo(out, eye, target, up) {
		var eyex = eye[0],
		    eyey = eye[1],
		    eyez = eye[2],
		    upx = up[0],
		    upy = up[1],
		    upz = up[2];
		var z0 = eyex - target[0],
		    z1 = eyey - target[1],
		    z2 = eyez - target[2];
		var len = z0 * z0 + z1 * z1 + z2 * z2;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			z0 *= len;
			z1 *= len;
			z2 *= len;
		}
		var x0 = upy * z2 - upz * z1,
		    x1 = upz * z0 - upx * z2,
		    x2 = upx * z1 - upy * z0;
		len = x0 * x0 + x1 * x1 + x2 * x2;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}
		out[0] = x0;
		out[1] = x1;
		out[2] = x2;
		out[3] = 0;
		out[4] = z1 * x2 - z2 * x1;
		out[5] = z2 * x0 - z0 * x2;
		out[6] = z0 * x1 - z1 * x0;
		out[7] = 0;
		out[8] = z0;
		out[9] = z1;
		out[10] = z2;
		out[11] = 0;
		out[12] = eyex;
		out[13] = eyey;
		out[14] = eyez;
		out[15] = 1;
		return out;
	}

	/**
	 * Transpose the values of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	function transpose(out, a) {
		// If we are transposing ourselves we can skip a few steps but have to cache some values
		if (out === a) {
			var a01 = a[1],
			    a02 = a[2],
			    a03 = a[3];
			var a12 = a[6],
			    a13 = a[7];
			var a23 = a[11];

			out[1] = a[4];
			out[2] = a[8];
			out[3] = a[12];
			out[4] = a01;
			out[6] = a[9];
			out[7] = a[13];
			out[8] = a02;
			out[9] = a12;
			out[11] = a[14];
			out[12] = a03;
			out[13] = a13;
			out[14] = a23;
		} else {
			out[0] = a[0];
			out[1] = a[4];
			out[2] = a[8];
			out[3] = a[12];
			out[4] = a[1];
			out[5] = a[5];
			out[6] = a[9];
			out[7] = a[13];
			out[8] = a[2];
			out[9] = a[6];
			out[10] = a[10];
			out[11] = a[14];
			out[12] = a[3];
			out[13] = a[7];
			out[14] = a[11];
			out[15] = a[15];
		}

		return out;
	}

	/**
	 * Inverts a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	function invert(out, a) {
		var a00 = a[0],
		    a01 = a[1],
		    a02 = a[2],
		    a03 = a[3];
		var a10 = a[4],
		    a11 = a[5],
		    a12 = a[6],
		    a13 = a[7];
		var a20 = a[8],
		    a21 = a[9],
		    a22 = a[10],
		    a23 = a[11];
		var a30 = a[12],
		    a31 = a[13],
		    a32 = a[14],
		    a33 = a[15];

		var b00 = a00 * a11 - a01 * a10;
		var b01 = a00 * a12 - a02 * a10;
		var b02 = a00 * a13 - a03 * a10;
		var b03 = a01 * a12 - a02 * a11;
		var b04 = a01 * a13 - a03 * a11;
		var b05 = a02 * a13 - a03 * a12;
		var b06 = a20 * a31 - a21 * a30;
		var b07 = a20 * a32 - a22 * a30;
		var b08 = a20 * a33 - a23 * a30;
		var b09 = a21 * a32 - a22 * a31;
		var b10 = a21 * a33 - a23 * a31;
		var b11 = a22 * a33 - a23 * a32;

		// Calculate the determinant
		var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (!det) {
			return null;
		}
		det = 1.0 / det;

		out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
		out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
		out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
		out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
		out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
		out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
		out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
		out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
		out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
		out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
		out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
		out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
		out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
		out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
		out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
		out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

		return out;
	}

	var mat4 = /*#__PURE__*/Object.freeze({
		create: create,
		multiply: multiply,
		perspective: perspective,
		identity: identity,
		clone: clone,
		fromTranslation: fromTranslation,
		fromYRotation: fromYRotation,
		lookAt: lookAt,
		fromRotationTranslationScale: fromRotationTranslationScale,
		fromXRotation: fromXRotation,
		targetTo: targetTo,
		transpose: transpose,
		invert: invert
	});

	function create$1() {
		var out = new ARRAY_TYPE(4);
		if (ARRAY_TYPE != Float32Array) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
		}
		out[3] = 1;
		return out;
	}

	var quat = /*#__PURE__*/Object.freeze({
		create: create$1
	});

	function create$2() {
		var out = new ARRAY_TYPE(3);
		if (ARRAY_TYPE != Float32Array) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
		}
		return out;
	}

	function add(out, a, b) {
		out[0] = a[0] + b[0];
		out[1] = a[1] + b[1];
		out[2] = a[2] + b[2];
		return out;
	}

	function rotateZ(out, a, b, c) {
		var p = [],
		    r = [];
		//Translate point to the origin
		p[0] = a[0] - b[0];
		p[1] = a[1] - b[1];
		p[2] = a[2] - b[2];
		//perform rotation
		r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
		r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
		r[2] = p[2];
		//translate to correct position
		out[0] = r[0] + b[0];
		out[1] = r[1] + b[1];
		out[2] = r[2] + b[2];
		return out;
	}

	function rotateY(out, a, b, c) {
		var p = [],
		    r = [];
		//Translate point to the origin
		p[0] = a[0] - b[0];
		p[1] = a[1] - b[1];
		p[2] = a[2] - b[2];
		//perform rotation
		r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
		r[1] = p[1];
		r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);
		//translate to correct position
		out[0] = r[0] + b[0];
		out[1] = r[1] + b[1];
		out[2] = r[2] + b[2];
		return out;
	}

	function transformMat4(out, a, m) {
		var x = a[0],
		    y = a[1],
		    z = a[2];
		var w = m[3] * x + m[7] * y + m[11] * z + m[15];
		w = w || 1.0;
		out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
		out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
		out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
		return out;
	}

	/**
	 * Normalize a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to normalize
	 * @returns {vec3} out
	 */

	function normalize(out, a) {
		var x = a[0];
		var y = a[1];
		var z = a[2];
		var len = x * x + y * y + z * z;
		if (len > 0) {
			//TODO: evaluate use of glm_invsqrt here?
			len = 1 / Math.sqrt(len);
			out[0] = a[0] * len;
			out[1] = a[1] * len;
			out[2] = a[2] * len;
		}
		return out;
	}

	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */

	function cross(out, a, b) {
		var ax = a[0],
		    ay = a[1],
		    az = a[2];
		var bx = b[0],
		    by = b[1],
		    bz = b[2];
		out[0] = ay * bz - az * by;
		out[1] = az * bx - ax * bz;
		out[2] = ax * by - ay * bx;
		return out;
	}

	var vec3 = /*#__PURE__*/Object.freeze({
		create: create$2,
		add: add,
		rotateZ: rotateZ,
		rotateY: rotateY,
		transformMat4: transformMat4,
		normalize: normalize,
		cross: cross
	});

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function range(min, max) {
		return (max - min) * Math.random() + min;
	}

	// https://stackoverflow.com/questions/32861804/how-to-calculate-the-centre-point-of-a-circle-given-three-points
	function calculateCircleCenter(A, B, C) {
		var yDelta_a = B.y - A.y;
		var xDelta_a = B.x - A.x;
		var yDelta_b = C.y - B.y;
		var xDelta_b = C.x - B.x;

		var center = {};

		var aSlope = yDelta_a / xDelta_a;
		var bSlope = yDelta_b / xDelta_b;

		center.x = (aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) / (2 * (bSlope - aSlope));
		center.y = -1 * (center.x - (A.x + B.x) / 2) / aSlope + (A.y + B.y) / 2;

		return center;
	}

	/**
	 * mix — linearly interpolate between two values
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} a
	 */
	function mix(x, y, a) {
		return x * (1 - a) + y * a;
	}

	function degToRad(value) {
		// Math.PI / 180 = 0.017453292519943295
		return value * 0.017453292519943295;
	}

	function radToDeg(value) {
		// 180 / Math.PI = 57.29577951308232
		return 57.29577951308232 * value;
	}

	var math = /*#__PURE__*/Object.freeze({
		clamp: clamp,
		range: range,
		calculateCircleCenter: calculateCircleCenter,
		mix: mix,
		degToRad: degToRad,
		radToDeg: radToDeg
	});

	// based on gl-matrix

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var Camera = function () {
		function Camera(width, height) {
			var fov = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 45;
			var near = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
			var far = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1000;
			classCallCheck(this, Camera);

			this.position = { x: 0, y: 0, z: 0 };
			this.lookAtPosition = { x: 0, y: 0, z: 0 };

			this._viewMatrix = create();
			this._projectionMatrix = create();

			this.updatePerspective(width, height, fov, near, far);
		}

		createClass(Camera, [{
			key: 'updatePerspective',
			value: function updatePerspective(width, height, fov, near, far) {
				perspective(this._projectionMatrix, fov / 180 * Math.PI, width / height, near, far);
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition() {
				var xx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var yy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var zz = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

				this.position.x = xx;
				this.position.y = yy;
				this.position.z = zz;
			}
		}, {
			key: 'updateLookAtPosition',
			value: function updateLookAtPosition() {
				var xx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var yy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
				var zz = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -100;

				this.lookAtPosition.x = xx;
				this.lookAtPosition.y = yy;
				this.lookAtPosition.z = zz;
			}
		}, {
			key: 'updateViewMatrix',
			value: function updateViewMatrix() {
				lookAt(this._viewMatrix, [this.position.x, this.position.y, this.position.z], [this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z], [0, 1, 0]);
				// console.log(this.position);
				// console.log(this._viewMatrix);
			}
		}, {
			key: 'viewMatrix',
			get: function get$$1() {
				return this._viewMatrix;
			}
		}, {
			key: 'projectionMatrix',
			get: function get$$1() {
				return this._projectionMatrix;
			}
		}]);
		return Camera;
	}();

	console.log('[danshariGL] version: DANSHARI_VERSOIN, %o', 'https://github.com/kenjiSpecial/tubugl');

	exports.getUniformLocations = getUniformLocations;
	exports.addLineNumbers = addLineNumbers;
	exports.compileGLShader = compileGLShader;
	exports.createPrgoram = createPrgoram;
	exports.creteBuffer = creteBuffer;
	exports.createIndex = createIndex;
	exports.bindBuffer = bindBuffer;
	exports.getSphere = getSphere;
	exports.Camera = Camera;
	exports.glMatrix = common;
	exports.mat4 = mat4;
	exports.quat = quat;
	exports.vec3 = vec3;
	exports.math = math;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHNyZ2wuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy9jb25zdHMuanMiLCIuLi9zcmMvdXRpbHMvZnVuY3Rpb25zLmpzIiwiLi4vc3JjL3V0aWxzL2dlbmVyYS1nZW9tZXRyeS5qcyIsIi4uL3NyYy9tYXRoL2dsLW1hdHJpeC9jb21tb24uanMiLCIuLi9zcmMvbWF0aC9nbC1tYXRyaXgvbWF0NC5qcyIsIi4uL3NyYy9tYXRoL2dsLW1hdHJpeC9xdWF0LmpzIiwiLi4vc3JjL21hdGgvZ2wtbWF0cml4L3ZlYzMuanMiLCIuLi9zcmMvbWF0aC9tYXRoLmpzIiwiLi4vc3JjL21hdGgvaW5kZXguanMiLCIuLi9zcmMvY2FtZXJhL2luZGV4LmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBGTE9BVCA9IDB4MTQwNjtcclxuIiwiaW1wb3J0IHsgRkxPQVQgfSBmcm9tICcuL2NvbnN0cyc7XHJcblxyXG4vKipcclxuICogZ2V0IHVuaWZvcm0gbG9jYXRpb25zXHJcbiAqXHJcbiAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gKiBAcGFyYW0ge1dlYkdMUHJvZ3JhbX0gcHJvZ3JhbVxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcclxuICpcclxuICogQHJldHVybnMge29iamVjdH0gdW5pZm9ybUxvY2F0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5pZm9ybUxvY2F0aW9ucyhnbCwgcHJvZ3JhbSwgYXJyKSB7XHJcblx0bGV0IGxvY2F0aW9ucyA9IHt9O1xyXG5cclxuXHRmb3IgKGxldCBpaSA9IDA7IGlpIDwgYXJyLmxlbmd0aDsgaWkrKykge1xyXG5cdFx0bGV0IG5hbWUgPSBhcnJbaWldO1xyXG5cdFx0bGV0IHVuaWZvcm1Mb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBuYW1lKTtcclxuXHRcdGxvY2F0aW9uc1tuYW1lXSA9IHVuaWZvcm1Mb2NhdGlvbjtcclxuXHR9XHJcblxyXG5cdHJldHVybiBsb2NhdGlvbnM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBjb21waWxlIHNoYWRlciBiYXNlZCBvbiB0aHJlZS5qc1xyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRMaW5lTnVtYmVycyhzdHJpbmcpIHtcclxuXHRsZXQgbGluZXMgPSBzdHJpbmcuc3BsaXQoJ1xcbicpO1xyXG5cclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRsaW5lc1tpXSA9IGkgKyAxICsgJzogJyArIGxpbmVzW2ldO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xyXG59XHJcblxyXG4vKipcclxuICogY29tcGlsZSB3ZWJnbCBzaGFkZXJcclxuICpcclxuICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsXHJcbiAqIEBwYXJhbSB7Kn0gdHlwZVxyXG4gKiBAcGFyYW0geyp9IHNoYWRlclNvdXJjZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVHTFNoYWRlcihnbCwgdHlwZSwgc2hhZGVyU291cmNlKSB7XHJcblx0bGV0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcclxuXHJcblx0Z2wuc2hhZGVyU291cmNlKHNoYWRlciwgc2hhZGVyU291cmNlKTtcclxuXHRnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XHJcblxyXG5cdGlmIChnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuXHRcdHJldHVybiBzaGFkZXI7XHJcblx0fSBlbHNlIHtcclxuXHRcdGNvbnNvbGUuZXJyb3IoXCJbV2ViR0xTaGFkZXJdOiBTaGFkZXIgY291bGRuJ3QgY29tcGlsZS5cIik7XHJcblxyXG5cdFx0aWYgKGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKSAhPT0gJycpIHtcclxuXHRcdFx0Y29uc29sZS53YXJuKFxyXG5cdFx0XHRcdCdbV2ViR0xTaGFkZXJdOiBnbC5nZXRTaGFkZXJJbmZvTG9nKCknLFxyXG5cdFx0XHRcdHR5cGUgPT09IGdsLlZFUlRFWF9TSEFERVIgPyAndmVydGV4JyA6ICdmcmFnbWVudCcsXHJcblx0XHRcdFx0Z2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpLFxyXG5cdFx0XHRcdGFkZExpbmVOdW1iZXJzKHNoYWRlclNvdXJjZSlcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGNyZWF0ZSBwcm9ncmFtXHJcbiAqXHJcbiAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmVydHhTaGFkZXJTcmNcclxuICogQHBhcmFtIHtTdHJpbmd9IGZyYWdtZW50U2hhZGVyU3JjXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtXZWJHTFByb2dyYW19IHByb2dyYW1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcmdvcmFtKGdsLCB2ZXJ0ZXhTaGFkZXJTcmMsIGZyYWdtZW50U2hhZGVyU3JjKSB7XHJcblx0Y29uc3QgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuXHJcblx0Y29uc3QgdmVydGV4U2hhZGVyID0gY29tcGlsZUdMU2hhZGVyKGdsLCBnbC5WRVJURVhfU0hBREVSLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xyXG5cdGNvbnN0IGZyYWdtZW50U2hhZGVyID0gY29tcGlsZUdMU2hhZGVyKGdsLCBnbC5GUkFHTUVOVF9TSEFERVIsIGZyYWdtZW50U2hhZGVyU3JjKTtcclxuXHJcblx0Z2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleFNoYWRlcik7XHJcblx0Z2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcclxuXHRnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcclxuXHJcblx0dHJ5IHtcclxuXHRcdGxldCBzdWNjZXNzID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUyk7XHJcblx0XHRpZiAoIXN1Y2Nlc3MpIHRocm93IGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pO1xyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRjb25zb2xlLmVycm9yKGBXZWJHTFByb2dyYW06ICR7ZXJyb3J9YCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcHJvZ3JhbTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGdldCB1bmlmb3JtIGxvY2F0aW9uc1xyXG4gKlxyXG4gKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW1cclxuICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IGRhdGFcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxyXG4gKlxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB1bmlmb3JtTG9jYXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmV0ZUJ1ZmZlcihnbCwgcHJvZ3JhbSwgZGF0YSwgc3RyKSB7XHJcblx0Y29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0Y29uc3QgbG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBzdHIpO1xyXG5cclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKTtcclxuXHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xyXG5cclxuXHRyZXR1cm4geyBidWZmZXIsIGxvY2F0aW9uIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBnZXQgdW5pZm9ybSBsb2NhdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsXHJcbiAqIEBwYXJhbSB7V2ViR0xQcm9ncmFtfSBwcm9ncmFtXHJcbiAqIEBwYXJhbSB7VWludDE2QXJyYXkgfCBVaW50MzJBcnJheX0gZGF0YVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHVuaWZvcm1Mb2NhdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluZGV4KGdsLCBpbmRpY2VzKSB7XHJcblx0Y29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVyKTtcclxuXHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG5cdGNvbnN0IGNudCA9IGluZGljZXMubGVuZ3RoO1xyXG5cdHJldHVybiB7IGNudCwgYnVmZmVyIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICogQHBhcmFtIHtXZWJHTEJ1ZmZlcn0gYnVmZmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBsb2NhdGlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2l6ZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG5vcm1hbGl6ZWRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYmluZEJ1ZmZlcihcclxuXHRnbCxcclxuXHRidWZmZXIsXHJcblx0bG9jYXRpb24gPSAwLFxyXG5cdHNpemUgPSAxLFxyXG5cdHR5cGUgPSBGTE9BVCxcclxuXHRub3JtYWxpemVkID0gZmFsc2UsXHJcblx0c3RyaWRlID0gMCxcclxuXHRvZmZzZXQgPSAwXHJcbikge1xyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jYXRpb24sIHNpemUsIHR5cGUsIG5vcm1hbGl6ZWQsIHN0cmlkZSwgb2Zmc2V0KTtcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XHJcbn1cclxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldFNwaGVyZShyYWRpdXMgPSAyLCBsYXRpdHVkZUJhbmRzID0gNjQsIGxvbmdpdHVkZUJhbmRzID0gNjQpIHtcclxuXHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHR2YXIgdGV4dHVyZXMgPSBbXTtcclxuXHR2YXIgbm9ybWFscyA9IFtdO1xyXG5cdHZhciBpbmRpY2VzID0gW107XHJcblxyXG5cdGZvciAodmFyIGxhdE51bWJlciA9IDA7IGxhdE51bWJlciA8PSBsYXRpdHVkZUJhbmRzOyArK2xhdE51bWJlcikge1xyXG5cdFx0dmFyIHRoZXRhID0gKGxhdE51bWJlciAqIE1hdGguUEkpIC8gbGF0aXR1ZGVCYW5kcztcclxuXHRcdHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcclxuXHRcdHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcclxuXHJcblx0XHRmb3IgKHZhciBsb25nTnVtYmVyID0gMDsgbG9uZ051bWJlciA8PSBsb25naXR1ZGVCYW5kczsgKytsb25nTnVtYmVyKSB7XHJcblx0XHRcdHZhciBwaGkgPSAobG9uZ051bWJlciAqIDIgKiBNYXRoLlBJKSAvIGxvbmdpdHVkZUJhbmRzO1xyXG5cdFx0XHR2YXIgc2luUGhpID0gTWF0aC5zaW4ocGhpKTtcclxuXHRcdFx0dmFyIGNvc1BoaSA9IE1hdGguY29zKHBoaSk7XHJcblxyXG5cdFx0XHR2YXIgeCA9IGNvc1BoaSAqIHNpblRoZXRhO1xyXG5cdFx0XHR2YXIgeSA9IGNvc1RoZXRhO1xyXG5cdFx0XHR2YXIgeiA9IHNpblBoaSAqIHNpblRoZXRhO1xyXG5cdFx0XHR2YXIgdSA9IDEgLSBsb25nTnVtYmVyIC8gbG9uZ2l0dWRlQmFuZHM7XHJcblx0XHRcdHZhciB2ID0gMSAtIGxhdE51bWJlciAvIGxhdGl0dWRlQmFuZHM7XHJcblxyXG5cdFx0XHRub3JtYWxzLnB1c2goeCwgeSwgeik7XHJcblx0XHRcdHRleHR1cmVzLnB1c2godSwgdik7XHJcblx0XHRcdHZlcnRpY2VzLnB1c2gocmFkaXVzICogeCwgcmFkaXVzICogeSwgcmFkaXVzICogeik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmb3IgKGxhdE51bWJlciA9IDA7IGxhdE51bWJlciA8IGxhdGl0dWRlQmFuZHM7ICsrbGF0TnVtYmVyKSB7XHJcblx0XHRmb3IgKGxvbmdOdW1iZXIgPSAwOyBsb25nTnVtYmVyIDwgbG9uZ2l0dWRlQmFuZHM7ICsrbG9uZ051bWJlcikge1xyXG5cdFx0XHR2YXIgZmlyc3QgPSBsYXROdW1iZXIgKiAobG9uZ2l0dWRlQmFuZHMgKyAxKSArIGxvbmdOdW1iZXI7XHJcblx0XHRcdHZhciBzZWNvbmQgPSBmaXJzdCArIGxvbmdpdHVkZUJhbmRzICsgMTtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKHNlY29uZCwgZmlyc3QsIGZpcnN0ICsgMSwgc2Vjb25kICsgMSwgc2Vjb25kLCBmaXJzdCArIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHZlcnRpY2VzOiB2ZXJ0aWNlcyxcclxuXHRcdHRleHR1cmVzOiB0ZXh0dXJlcyxcclxuXHRcdG5vcm1hbHM6IG5vcm1hbHMsXHJcblx0XHRpbmRpY2VzOiBpbmRpY2VzXHJcblx0fTtcclxufVxyXG4iLCJleHBvcnQgY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xyXG5leHBvcnQgbGV0IEFSUkFZX1RZUEUgPSB0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJyA/IEZsb2F0MzJBcnJheSA6IEFycmF5O1xyXG5leHBvcnQgY29uc3QgUkFORE9NID0gTWF0aC5yYW5kb207XHJcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gJy4vY29tbW9uJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0bGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcclxuXHRpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdG91dFsxXSA9IDA7XHJcblx0XHRvdXRbMl0gPSAwO1xyXG5cdFx0b3V0WzNdID0gMDtcclxuXHRcdG91dFs0XSA9IDA7XHJcblx0XHRvdXRbNl0gPSAwO1xyXG5cdFx0b3V0WzddID0gMDtcclxuXHRcdG91dFs4XSA9IDA7XHJcblx0XHRvdXRbOV0gPSAwO1xyXG5cdFx0b3V0WzExXSA9IDA7XHJcblx0XHRvdXRbMTJdID0gMDtcclxuXHRcdG91dFsxM10gPSAwO1xyXG5cdFx0b3V0WzE0XSA9IDA7XHJcblx0fVxyXG5cdG91dFswXSA9IDE7XHJcblx0b3V0WzVdID0gMTtcclxuXHRvdXRbMTBdID0gMTtcclxuXHRvdXRbMTVdID0gMTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcblx0bGV0IGEwMCA9IGFbMF0sXHJcblx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0YTAyID0gYVsyXSxcclxuXHRcdGEwMyA9IGFbM107XHJcblx0bGV0IGExMCA9IGFbNF0sXHJcblx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0YTEyID0gYVs2XSxcclxuXHRcdGExMyA9IGFbN107XHJcblx0bGV0IGEyMCA9IGFbOF0sXHJcblx0XHRhMjEgPSBhWzldLFxyXG5cdFx0YTIyID0gYVsxMF0sXHJcblx0XHRhMjMgPSBhWzExXTtcclxuXHRsZXQgYTMwID0gYVsxMl0sXHJcblx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdGEzMiA9IGFbMTRdLFxyXG5cdFx0YTMzID0gYVsxNV07XHJcblx0Ly8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XHJcblx0bGV0IGIwID0gYlswXSxcclxuXHRcdGIxID0gYlsxXSxcclxuXHRcdGIyID0gYlsyXSxcclxuXHRcdGIzID0gYlszXTtcclxuXHRvdXRbMF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcclxuXHRvdXRbMV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcclxuXHRvdXRbMl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcclxuXHRvdXRbM10gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcclxuXHRiMCA9IGJbNF07XHJcblx0YjEgPSBiWzVdO1xyXG5cdGIyID0gYls2XTtcclxuXHRiMyA9IGJbN107XHJcblx0b3V0WzRdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XHJcblx0b3V0WzVdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XHJcblx0b3V0WzZdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XHJcblx0b3V0WzddID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XHJcblx0YjAgPSBiWzhdO1xyXG5cdGIxID0gYls5XTtcclxuXHRiMiA9IGJbMTBdO1xyXG5cdGIzID0gYlsxMV07XHJcblx0b3V0WzhdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XHJcblx0b3V0WzldID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XHJcblx0b3V0WzEwXSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xyXG5cdG91dFsxMV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcclxuXHRiMCA9IGJbMTJdO1xyXG5cdGIxID0gYlsxM107XHJcblx0YjIgPSBiWzE0XTtcclxuXHRiMyA9IGJbMTVdO1xyXG5cdG91dFsxMl0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcclxuXHRvdXRbMTNdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XHJcblx0b3V0WzE0XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xyXG5cdG91dFsxNV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmUob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xyXG5cdGxldCBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxyXG5cdFx0bmY7XHJcblx0b3V0WzBdID0gZiAvIGFzcGVjdDtcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IDA7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSAwO1xyXG5cdG91dFs1XSA9IGY7XHJcblx0b3V0WzZdID0gMDtcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IDA7XHJcblx0b3V0WzldID0gMDtcclxuXHRvdXRbMTFdID0gLTE7XHJcblx0b3V0WzEyXSA9IDA7XHJcblx0b3V0WzEzXSA9IDA7XHJcblx0b3V0WzE1XSA9IDA7XHJcblx0aWYgKGZhciAhPSBudWxsICYmIGZhciAhPT0gSW5maW5pdHkpIHtcclxuXHRcdG5mID0gMSAvIChuZWFyIC0gZmFyKTtcclxuXHRcdG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcclxuXHRcdG91dFsxNF0gPSAyICogZmFyICogbmVhciAqIG5mO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRvdXRbMTBdID0gLTE7XHJcblx0XHRvdXRbMTRdID0gLTIgKiBuZWFyO1xyXG5cdH1cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XHJcblx0b3V0WzBdID0gMTtcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IDA7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSAwO1xyXG5cdG91dFs1XSA9IDE7XHJcblx0b3V0WzZdID0gMDtcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IDA7XHJcblx0b3V0WzldID0gMDtcclxuXHRvdXRbMTBdID0gMTtcclxuXHRvdXRbMTFdID0gMDtcclxuXHRvdXRbMTJdID0gMDtcclxuXHRvdXRbMTNdID0gMDtcclxuXHRvdXRbMTRdID0gMDtcclxuXHRvdXRbMTVdID0gMTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUobWF0KSB7XHJcblx0bGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcclxuXHRmb3IgKGxldCBpaSA9IDA7IGlpIDwgb3V0Lmxlbmd0aDsgaWkrKykge1xyXG5cdFx0b3V0W2lpXSA9IG1hdFtpaV07XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xyXG5cdG91dFswXSA9IDE7XHJcblx0b3V0WzFdID0gMDtcclxuXHRvdXRbMl0gPSAwO1xyXG5cdG91dFszXSA9IDA7XHJcblx0b3V0WzRdID0gMDtcclxuXHRvdXRbNV0gPSAxO1xyXG5cdG91dFs2XSA9IDA7XHJcblx0b3V0WzddID0gMDtcclxuXHRvdXRbOF0gPSAwO1xyXG5cdG91dFs5XSA9IDA7XHJcblx0b3V0WzEwXSA9IDE7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IHZbMF07XHJcblx0b3V0WzEzXSA9IHZbMV07XHJcblx0b3V0WzE0XSA9IHZbMl07XHJcblx0b3V0WzE1XSA9IDE7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcblx0bGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG5cdC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0b3V0WzBdID0gYztcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IC1zO1xyXG5cdG91dFszXSA9IDA7XHJcblx0b3V0WzRdID0gMDtcclxuXHRvdXRbNV0gPSAxO1xyXG5cdG91dFs2XSA9IDA7XHJcblx0b3V0WzddID0gMDtcclxuXHRvdXRbOF0gPSBzO1xyXG5cdG91dFs5XSA9IDA7XHJcblx0b3V0WzEwXSA9IGM7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IDA7XHJcblx0b3V0WzEzXSA9IDA7XHJcblx0b3V0WzE0XSA9IDA7XHJcblx0b3V0WzE1XSA9IDE7XHJcblxyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcclxuXHRsZXQgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuO1xyXG5cdGxldCBleWV4ID0gZXllWzBdO1xyXG5cdGxldCBleWV5ID0gZXllWzFdO1xyXG5cdGxldCBleWV6ID0gZXllWzJdO1xyXG5cdGxldCB1cHggPSB1cFswXTtcclxuXHRsZXQgdXB5ID0gdXBbMV07XHJcblx0bGV0IHVweiA9IHVwWzJdO1xyXG5cdGxldCBjZW50ZXJ4ID0gY2VudGVyWzBdO1xyXG5cdGxldCBjZW50ZXJ5ID0gY2VudGVyWzFdO1xyXG5cdGxldCBjZW50ZXJ6ID0gY2VudGVyWzJdO1xyXG5cclxuXHRpZiAoXHJcblx0XHRNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXHJcblx0XHRNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXHJcblx0XHRNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBnbE1hdHJpeC5FUFNJTE9OXHJcblx0KSB7XHJcblx0XHRyZXR1cm4gaWRlbnRpdHkob3V0KTtcclxuXHR9XHJcblxyXG5cdHowID0gZXlleCAtIGNlbnRlcng7XHJcblx0ejEgPSBleWV5IC0gY2VudGVyeTtcclxuXHR6MiA9IGV5ZXogLSBjZW50ZXJ6O1xyXG5cclxuXHRsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XHJcblx0ejAgKj0gbGVuO1xyXG5cdHoxICo9IGxlbjtcclxuXHR6MiAqPSBsZW47XHJcblxyXG5cdHgwID0gdXB5ICogejIgLSB1cHogKiB6MTtcclxuXHR4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XHJcblx0eDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xyXG5cdGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpO1xyXG5cdGlmICghbGVuKSB7XHJcblx0XHR4MCA9IDA7XHJcblx0XHR4MSA9IDA7XHJcblx0XHR4MiA9IDA7XHJcblx0fSBlbHNlIHtcclxuXHRcdGxlbiA9IDEgLyBsZW47XHJcblx0XHR4MCAqPSBsZW47XHJcblx0XHR4MSAqPSBsZW47XHJcblx0XHR4MiAqPSBsZW47XHJcblx0fVxyXG5cclxuXHR5MCA9IHoxICogeDIgLSB6MiAqIHgxO1xyXG5cdHkxID0gejIgKiB4MCAtIHowICogeDI7XHJcblx0eTIgPSB6MCAqIHgxIC0gejEgKiB4MDtcclxuXHJcblx0bGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XHJcblx0aWYgKCFsZW4pIHtcclxuXHRcdHkwID0gMDtcclxuXHRcdHkxID0gMDtcclxuXHRcdHkyID0gMDtcclxuXHR9IGVsc2Uge1xyXG5cdFx0bGVuID0gMSAvIGxlbjtcclxuXHRcdHkwICo9IGxlbjtcclxuXHRcdHkxICo9IGxlbjtcclxuXHRcdHkyICo9IGxlbjtcclxuXHR9XHJcblxyXG5cdG91dFswXSA9IHgwO1xyXG5cdG91dFsxXSA9IHkwO1xyXG5cdG91dFsyXSA9IHowO1xyXG5cdG91dFszXSA9IDA7XHJcblx0b3V0WzRdID0geDE7XHJcblx0b3V0WzVdID0geTE7XHJcblx0b3V0WzZdID0gejE7XHJcblx0b3V0WzddID0gMDtcclxuXHRvdXRbOF0gPSB4MjtcclxuXHRvdXRbOV0gPSB5MjtcclxuXHRvdXRbMTBdID0gejI7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcclxuXHRvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xyXG5cdG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleik7XHJcblx0b3V0WzE1XSA9IDE7XHJcblxyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xyXG5cdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdGxldCB4ID0gcVswXSxcclxuXHRcdHkgPSBxWzFdLFxyXG5cdFx0eiA9IHFbMl0sXHJcblx0XHR3ID0gcVszXTtcclxuXHRsZXQgeDIgPSB4ICsgeDtcclxuXHRsZXQgeTIgPSB5ICsgeTtcclxuXHRsZXQgejIgPSB6ICsgejtcclxuXHRsZXQgeHggPSB4ICogeDI7XHJcblx0bGV0IHh5ID0geCAqIHkyO1xyXG5cdGxldCB4eiA9IHggKiB6MjtcclxuXHRsZXQgeXkgPSB5ICogeTI7XHJcblx0bGV0IHl6ID0geSAqIHoyO1xyXG5cdGxldCB6eiA9IHogKiB6MjtcclxuXHRsZXQgd3ggPSB3ICogeDI7XHJcblx0bGV0IHd5ID0gdyAqIHkyO1xyXG5cdGxldCB3eiA9IHcgKiB6MjtcclxuXHRsZXQgc3ggPSBzWzBdO1xyXG5cdGxldCBzeSA9IHNbMV07XHJcblx0bGV0IHN6ID0gc1syXTtcclxuXHRvdXRbMF0gPSAoMSAtICh5eSArIHp6KSkgKiBzeDtcclxuXHRvdXRbMV0gPSAoeHkgKyB3eikgKiBzeDtcclxuXHRvdXRbMl0gPSAoeHogLSB3eSkgKiBzeDtcclxuXHRvdXRbM10gPSAwO1xyXG5cdG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5O1xyXG5cdG91dFs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xyXG5cdG91dFs2XSA9ICh5eiArIHd4KSAqIHN5O1xyXG5cdG91dFs3XSA9IDA7XHJcblx0b3V0WzhdID0gKHh6ICsgd3kpICogc3o7XHJcblx0b3V0WzldID0gKHl6IC0gd3gpICogc3o7XHJcblx0b3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xyXG5cdG91dFsxMV0gPSAwO1xyXG5cdG91dFsxMl0gPSB2WzBdO1xyXG5cdG91dFsxM10gPSB2WzFdO1xyXG5cdG91dFsxNF0gPSB2WzJdO1xyXG5cdG91dFsxNV0gPSAxO1xyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tWFJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0bGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG5cdGxldCBjID0gTWF0aC5jb3MocmFkKTtcclxuXHQvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblx0b3V0WzBdID0gMTtcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IDA7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSAwO1xyXG5cdG91dFs1XSA9IGM7XHJcblx0b3V0WzZdID0gcztcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IDA7XHJcblx0b3V0WzldID0gLXM7XHJcblx0b3V0WzEwXSA9IGM7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IDA7XHJcblx0b3V0WzEzXSA9IDA7XHJcblx0b3V0WzE0XSA9IDA7XHJcblx0b3V0WzE1XSA9IDE7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRhcmdldFRvKG91dCwgZXllLCB0YXJnZXQsIHVwKSB7XHJcblx0bGV0IGV5ZXggPSBleWVbMF0sXHJcblx0XHRleWV5ID0gZXllWzFdLFxyXG5cdFx0ZXlleiA9IGV5ZVsyXSxcclxuXHRcdHVweCA9IHVwWzBdLFxyXG5cdFx0dXB5ID0gdXBbMV0sXHJcblx0XHR1cHogPSB1cFsyXTtcclxuXHRsZXQgejAgPSBleWV4IC0gdGFyZ2V0WzBdLFxyXG5cdFx0ejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxyXG5cdFx0ejIgPSBleWV6IC0gdGFyZ2V0WzJdO1xyXG5cdGxldCBsZW4gPSB6MCAqIHowICsgejEgKiB6MSArIHoyICogejI7XHJcblx0aWYgKGxlbiA+IDApIHtcclxuXHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuXHRcdHowICo9IGxlbjtcclxuXHRcdHoxICo9IGxlbjtcclxuXHRcdHoyICo9IGxlbjtcclxuXHR9XHJcblx0bGV0IHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcclxuXHRcdHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcclxuXHRcdHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcclxuXHRsZW4gPSB4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDI7XHJcblx0aWYgKGxlbiA+IDApIHtcclxuXHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuXHRcdHgwICo9IGxlbjtcclxuXHRcdHgxICo9IGxlbjtcclxuXHRcdHgyICo9IGxlbjtcclxuXHR9XHJcblx0b3V0WzBdID0geDA7XHJcblx0b3V0WzFdID0geDE7XHJcblx0b3V0WzJdID0geDI7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSB6MSAqIHgyIC0gejIgKiB4MTtcclxuXHRvdXRbNV0gPSB6MiAqIHgwIC0gejAgKiB4MjtcclxuXHRvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MDtcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IHowO1xyXG5cdG91dFs5XSA9IHoxO1xyXG5cdG91dFsxMF0gPSB6MjtcclxuXHRvdXRbMTFdID0gMDtcclxuXHRvdXRbMTJdID0gZXlleDtcclxuXHRvdXRbMTNdID0gZXlleTtcclxuXHRvdXRbMTRdID0gZXllejtcclxuXHRvdXRbMTVdID0gMTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xyXG5cdC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcclxuXHRpZiAob3V0ID09PSBhKSB7XHJcblx0XHRsZXQgYTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTAzID0gYVszXTtcclxuXHRcdGxldCBhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddO1xyXG5cdFx0bGV0IGEyMyA9IGFbMTFdO1xyXG5cclxuXHRcdG91dFsxXSA9IGFbNF07XHJcblx0XHRvdXRbMl0gPSBhWzhdO1xyXG5cdFx0b3V0WzNdID0gYVsxMl07XHJcblx0XHRvdXRbNF0gPSBhMDE7XHJcblx0XHRvdXRbNl0gPSBhWzldO1xyXG5cdFx0b3V0WzddID0gYVsxM107XHJcblx0XHRvdXRbOF0gPSBhMDI7XHJcblx0XHRvdXRbOV0gPSBhMTI7XHJcblx0XHRvdXRbMTFdID0gYVsxNF07XHJcblx0XHRvdXRbMTJdID0gYTAzO1xyXG5cdFx0b3V0WzEzXSA9IGExMztcclxuXHRcdG91dFsxNF0gPSBhMjM7XHJcblx0fSBlbHNlIHtcclxuXHRcdG91dFswXSA9IGFbMF07XHJcblx0XHRvdXRbMV0gPSBhWzRdO1xyXG5cdFx0b3V0WzJdID0gYVs4XTtcclxuXHRcdG91dFszXSA9IGFbMTJdO1xyXG5cdFx0b3V0WzRdID0gYVsxXTtcclxuXHRcdG91dFs1XSA9IGFbNV07XHJcblx0XHRvdXRbNl0gPSBhWzldO1xyXG5cdFx0b3V0WzddID0gYVsxM107XHJcblx0XHRvdXRbOF0gPSBhWzJdO1xyXG5cdFx0b3V0WzldID0gYVs2XTtcclxuXHRcdG91dFsxMF0gPSBhWzEwXTtcclxuXHRcdG91dFsxMV0gPSBhWzE0XTtcclxuXHRcdG91dFsxMl0gPSBhWzNdO1xyXG5cdFx0b3V0WzEzXSA9IGFbN107XHJcblx0XHRvdXRbMTRdID0gYVsxMV07XHJcblx0XHRvdXRbMTVdID0gYVsxNV07XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogSW52ZXJ0cyBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XHJcblx0bGV0IGEwMCA9IGFbMF0sXHJcblx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0YTAyID0gYVsyXSxcclxuXHRcdGEwMyA9IGFbM107XHJcblx0bGV0IGExMCA9IGFbNF0sXHJcblx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0YTEyID0gYVs2XSxcclxuXHRcdGExMyA9IGFbN107XHJcblx0bGV0IGEyMCA9IGFbOF0sXHJcblx0XHRhMjEgPSBhWzldLFxyXG5cdFx0YTIyID0gYVsxMF0sXHJcblx0XHRhMjMgPSBhWzExXTtcclxuXHRsZXQgYTMwID0gYVsxMl0sXHJcblx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdGEzMiA9IGFbMTRdLFxyXG5cdFx0YTMzID0gYVsxNV07XHJcblxyXG5cdGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XHJcblx0bGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcclxuXHRsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xyXG5cdGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XHJcblx0bGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcclxuXHRsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xyXG5cdGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XHJcblx0bGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcclxuXHRsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xyXG5cdGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XHJcblx0bGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcclxuXHRsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xyXG5cclxuXHQvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblx0bGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcclxuXHJcblx0aWYgKCFkZXQpIHtcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRkZXQgPSAxLjAgLyBkZXQ7XHJcblxyXG5cdG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xyXG5cdG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xyXG5cdG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xyXG5cdG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xyXG5cdG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xyXG5cdG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xyXG5cdG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xyXG5cdG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xyXG5cdG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xyXG5cdG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xyXG5cdG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcclxuXHRvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XHJcblx0b3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xyXG5cdG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcclxuXHRvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XHJcblx0b3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xyXG5cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gJy4vY29tbW9uJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0bGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xyXG5cdGlmIChnbE1hdHJpeC5BUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0b3V0WzBdID0gMDtcclxuXHRcdG91dFsxXSA9IDA7XHJcblx0XHRvdXRbMl0gPSAwO1xyXG5cdH1cclxuXHRvdXRbM10gPSAxO1xyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSAnLi9jb21tb24nO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XHJcblx0aWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRvdXRbMF0gPSAwO1xyXG5cdFx0b3V0WzFdID0gMDtcclxuXHRcdG91dFsyXSA9IDA7XHJcblx0fVxyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XHJcblx0b3V0WzBdID0gYVswXSArIGJbMF07XHJcblx0b3V0WzFdID0gYVsxXSArIGJbMV07XHJcblx0b3V0WzJdID0gYVsyXSArIGJbMl07XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCBiLCBjKSB7XHJcblx0bGV0IHAgPSBbXSxcclxuXHRcdHIgPSBbXTtcclxuXHQvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcblx0cFswXSA9IGFbMF0gLSBiWzBdO1xyXG5cdHBbMV0gPSBhWzFdIC0gYlsxXTtcclxuXHRwWzJdID0gYVsyXSAtIGJbMl07XHJcblx0Ly9wZXJmb3JtIHJvdGF0aW9uXHJcblx0clswXSA9IHBbMF0gKiBNYXRoLmNvcyhjKSAtIHBbMV0gKiBNYXRoLnNpbihjKTtcclxuXHRyWzFdID0gcFswXSAqIE1hdGguc2luKGMpICsgcFsxXSAqIE1hdGguY29zKGMpO1xyXG5cdHJbMl0gPSBwWzJdO1xyXG5cdC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuXHRvdXRbMF0gPSByWzBdICsgYlswXTtcclxuXHRvdXRbMV0gPSByWzFdICsgYlsxXTtcclxuXHRvdXRbMl0gPSByWzJdICsgYlsyXTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIGIsIGMpIHtcclxuXHRsZXQgcCA9IFtdLFxyXG5cdFx0ciA9IFtdO1xyXG5cdC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cclxuXHRwWzBdID0gYVswXSAtIGJbMF07XHJcblx0cFsxXSA9IGFbMV0gLSBiWzFdO1xyXG5cdHBbMl0gPSBhWzJdIC0gYlsyXTtcclxuXHQvL3BlcmZvcm0gcm90YXRpb25cclxuXHRyWzBdID0gcFsyXSAqIE1hdGguc2luKGMpICsgcFswXSAqIE1hdGguY29zKGMpO1xyXG5cdHJbMV0gPSBwWzFdO1xyXG5cdHJbMl0gPSBwWzJdICogTWF0aC5jb3MoYykgLSBwWzBdICogTWF0aC5zaW4oYyk7XHJcblx0Ly90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxyXG5cdG91dFswXSA9IHJbMF0gKyBiWzBdO1xyXG5cdG91dFsxXSA9IHJbMV0gKyBiWzFdO1xyXG5cdG91dFsyXSA9IHJbMl0gKyBiWzJdO1xyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xyXG5cdGxldCB4ID0gYVswXSxcclxuXHRcdHkgPSBhWzFdLFxyXG5cdFx0eiA9IGFbMl07XHJcblx0bGV0IHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XHJcblx0dyA9IHcgfHwgMS4wO1xyXG5cdG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSkgLyB3O1xyXG5cdG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSkgLyB3O1xyXG5cdG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gdztcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogTm9ybWFsaXplIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcclxuXHRsZXQgeCA9IGFbMF07XHJcblx0bGV0IHkgPSBhWzFdO1xyXG5cdGxldCB6ID0gYVsyXTtcclxuXHRsZXQgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6O1xyXG5cdGlmIChsZW4gPiAwKSB7XHJcblx0XHQvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG5cdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGxlbjtcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBsZW47XHJcblx0XHRvdXRbMl0gPSBhWzJdICogbGVuO1xyXG5cdH1cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xyXG5cdGxldCBheCA9IGFbMF0sXHJcblx0XHRheSA9IGFbMV0sXHJcblx0XHRheiA9IGFbMl07XHJcblx0bGV0IGJ4ID0gYlswXSxcclxuXHRcdGJ5ID0gYlsxXSxcclxuXHRcdGJ6ID0gYlsyXTtcclxuXHRvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcclxuXHRvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcclxuXHRvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcbiIsImV4cG9ydCBmdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcclxuXHRyZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIG1heCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByYW5nZShtaW4sIG1heCkge1xyXG5cdHJldHVybiAobWF4IC0gbWluKSAqIE1hdGgucmFuZG9tKCkgKyBtaW47XHJcbn1cclxuXHJcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMyODYxODA0L2hvdy10by1jYWxjdWxhdGUtdGhlLWNlbnRyZS1wb2ludC1vZi1hLWNpcmNsZS1naXZlbi10aHJlZS1wb2ludHNcclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUNpcmNsZUNlbnRlcihBLCBCLCBDKSB7XHJcblx0dmFyIHlEZWx0YV9hID0gQi55IC0gQS55O1xyXG5cdHZhciB4RGVsdGFfYSA9IEIueCAtIEEueDtcclxuXHR2YXIgeURlbHRhX2IgPSBDLnkgLSBCLnk7XHJcblx0dmFyIHhEZWx0YV9iID0gQy54IC0gQi54O1xyXG5cclxuXHRsZXQgY2VudGVyID0ge307XHJcblxyXG5cdHZhciBhU2xvcGUgPSB5RGVsdGFfYSAvIHhEZWx0YV9hO1xyXG5cdHZhciBiU2xvcGUgPSB5RGVsdGFfYiAvIHhEZWx0YV9iO1xyXG5cclxuXHRjZW50ZXIueCA9XHJcblx0XHQoYVNsb3BlICogYlNsb3BlICogKEEueSAtIEMueSkgKyBiU2xvcGUgKiAoQS54ICsgQi54KSAtIGFTbG9wZSAqIChCLnggKyBDLngpKSAvXHJcblx0XHQoMiAqIChiU2xvcGUgLSBhU2xvcGUpKTtcclxuXHRjZW50ZXIueSA9ICgtMSAqIChjZW50ZXIueCAtIChBLnggKyBCLngpIC8gMikpIC8gYVNsb3BlICsgKEEueSArIEIueSkgLyAyO1xyXG5cclxuXHRyZXR1cm4gY2VudGVyO1xyXG59XHJcblxyXG4vKipcclxuICogbWl4IOKAlCBsaW5lYXJseSBpbnRlcnBvbGF0ZSBiZXR3ZWVuIHR3byB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICogQHBhcmFtIHtudW1iZXJ9IGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaXgoeCwgeSwgYSkge1xyXG5cdHJldHVybiB4ICogKDEgLSBhKSArIHkgKiBhO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVnVG9SYWQodmFsdWUpIHtcclxuXHQvLyBNYXRoLlBJIC8gMTgwID0gMC4wMTc0NTMyOTI1MTk5NDMyOTVcclxuXHRyZXR1cm4gdmFsdWUgKiAwLjAxNzQ1MzI5MjUxOTk0MzI5NTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJhZFRvRGVnKHZhbHVlKSB7XHJcblx0Ly8gMTgwIC8gTWF0aC5QSSA9IDU3LjI5NTc3OTUxMzA4MjMyXHJcblx0cmV0dXJuIDU3LjI5NTc3OTUxMzA4MjMyICogdmFsdWU7XHJcbn1cclxuIiwiLy8gYmFzZWQgb24gZ2wtbWF0cml4XHJcbi8vIGV4dHJhY3QgbWV0aG9kIHdoaWNoIGlzIG9ubHkgdXNlZFxyXG5cclxuaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSAnLi9nbC1tYXRyaXgvY29tbW9uJztcclxuaW1wb3J0ICogYXMgbWF0NCBmcm9tICcuL2dsLW1hdHJpeC9tYXQ0JztcclxuaW1wb3J0ICogYXMgcXVhdCBmcm9tICcuL2dsLW1hdHJpeC9xdWF0JztcclxuaW1wb3J0ICogYXMgdmVjMyBmcm9tICcuL2dsLW1hdHJpeC92ZWMzJztcclxuaW1wb3J0ICogYXMgbWF0aCBmcm9tICcuL21hdGgnO1xyXG5cclxuZXhwb3J0IHsgZ2xNYXRyaXgsIG1hdDQsIHF1YXQsIHZlYzMsIG1hdGggfTtcclxuIiwiaW1wb3J0IHsgbWF0NCB9IGZyb20gJy4uL21hdGgnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENhbWVyYSB7XHJcblx0Y29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCwgZm92ID0gNDUsIG5lYXIgPSAwLjEsIGZhciA9IDEwMDApIHtcclxuXHRcdHRoaXMucG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuXHRcdHRoaXMubG9va0F0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuXHJcblx0XHR0aGlzLl92aWV3TWF0cml4ID0gbWF0NC5jcmVhdGUoKTtcclxuXHRcdHRoaXMuX3Byb2plY3Rpb25NYXRyaXggPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cclxuXHRcdHRoaXMudXBkYXRlUGVyc3BlY3RpdmUod2lkdGgsIGhlaWdodCwgZm92LCBuZWFyLCBmYXIpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlUGVyc3BlY3RpdmUod2lkdGgsIGhlaWdodCwgZm92LCBuZWFyLCBmYXIpIHtcclxuXHRcdG1hdDQucGVyc3BlY3RpdmUodGhpcy5fcHJvamVjdGlvbk1hdHJpeCwgKGZvdiAvIDE4MCkgKiBNYXRoLlBJLCB3aWR0aCAvIGhlaWdodCwgbmVhciwgZmFyKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVBvc2l0aW9uKHh4ID0gMCwgeXkgPSAwLCB6eiA9IDApIHtcclxuXHRcdHRoaXMucG9zaXRpb24ueCA9IHh4O1xyXG5cdFx0dGhpcy5wb3NpdGlvbi55ID0geXk7XHJcblx0XHR0aGlzLnBvc2l0aW9uLnogPSB6ejtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZUxvb2tBdFBvc2l0aW9uKHh4ID0gMCwgeXkgPSAwLCB6eiA9IC0xMDApIHtcclxuXHRcdHRoaXMubG9va0F0UG9zaXRpb24ueCA9IHh4O1xyXG5cdFx0dGhpcy5sb29rQXRQb3NpdGlvbi55ID0geXk7XHJcblx0XHR0aGlzLmxvb2tBdFBvc2l0aW9uLnogPSB6ejtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVZpZXdNYXRyaXgoKSB7XHJcblx0XHRtYXQ0Lmxvb2tBdChcclxuXHRcdFx0dGhpcy5fdmlld01hdHJpeCxcclxuXHRcdFx0W3RoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnBvc2l0aW9uLnpdLFxyXG5cdFx0XHRbdGhpcy5sb29rQXRQb3NpdGlvbi54LCB0aGlzLmxvb2tBdFBvc2l0aW9uLnksIHRoaXMubG9va0F0UG9zaXRpb24uel0sXHJcblx0XHRcdFswLCAxLCAwXVxyXG5cdFx0KTtcclxuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMucG9zaXRpb24pO1xyXG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5fdmlld01hdHJpeCk7XHJcblx0fVxyXG5cclxuXHRnZXQgdmlld01hdHJpeCgpIHtcclxuXHRcdHJldHVybiB0aGlzLl92aWV3TWF0cml4O1xyXG5cdH1cclxuXHJcblx0Z2V0IHByb2plY3Rpb25NYXRyaXgoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcHJvamVjdGlvbk1hdHJpeDtcclxuXHR9XHJcbn1cclxuIiwiY29uc29sZS5sb2coJ1tkYW5zaGFyaUdMXSB2ZXJzaW9uOiBEQU5TSEFSSV9WRVJTT0lOLCAlbycsICdodHRwczovL2dpdGh1Yi5jb20va2VuamlTcGVjaWFsL3R1YnVnbCcpO1xuXG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL2Z1bmN0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL2dlbmVyYS1nZW9tZXRyeSc7XG5leHBvcnQgKiBmcm9tICcuL2NhbWVyYSc7XG5leHBvcnQgKiBmcm9tICcuL21hdGgnO1xuIl0sIm5hbWVzIjpbIkZMT0FUIiwiZ2V0VW5pZm9ybUxvY2F0aW9ucyIsImdsIiwicHJvZ3JhbSIsImFyciIsImxvY2F0aW9ucyIsImlpIiwibGVuZ3RoIiwibmFtZSIsInVuaWZvcm1Mb2NhdGlvbiIsImdldFVuaWZvcm1Mb2NhdGlvbiIsImFkZExpbmVOdW1iZXJzIiwic3RyaW5nIiwibGluZXMiLCJzcGxpdCIsImkiLCJqb2luIiwiY29tcGlsZUdMU2hhZGVyIiwidHlwZSIsInNoYWRlclNvdXJjZSIsInNoYWRlciIsImNyZWF0ZVNoYWRlciIsImNvbXBpbGVTaGFkZXIiLCJnZXRTaGFkZXJQYXJhbWV0ZXIiLCJDT01QSUxFX1NUQVRVUyIsImNvbnNvbGUiLCJlcnJvciIsImdldFNoYWRlckluZm9Mb2ciLCJ3YXJuIiwiVkVSVEVYX1NIQURFUiIsImNyZWF0ZVByZ29yYW0iLCJ2ZXJ0ZXhTaGFkZXJTcmMiLCJmcmFnbWVudFNoYWRlclNyYyIsImNyZWF0ZVByb2dyYW0iLCJ2ZXJ0ZXhTaGFkZXIiLCJmcmFnbWVudFNoYWRlciIsIkZSQUdNRU5UX1NIQURFUiIsImF0dGFjaFNoYWRlciIsImxpbmtQcm9ncmFtIiwic3VjY2VzcyIsImdldFByb2dyYW1QYXJhbWV0ZXIiLCJMSU5LX1NUQVRVUyIsImdldFByb2dyYW1JbmZvTG9nIiwiY3JldGVCdWZmZXIiLCJkYXRhIiwic3RyIiwiYnVmZmVyIiwiY3JlYXRlQnVmZmVyIiwibG9jYXRpb24iLCJnZXRBdHRyaWJMb2NhdGlvbiIsImJpbmRCdWZmZXIiLCJBUlJBWV9CVUZGRVIiLCJidWZmZXJEYXRhIiwiU1RBVElDX0RSQVciLCJjcmVhdGVJbmRleCIsImluZGljZXMiLCJFTEVNRU5UX0FSUkFZX0JVRkZFUiIsImNudCIsInNpemUiLCJub3JtYWxpemVkIiwic3RyaWRlIiwib2Zmc2V0IiwidmVydGV4QXR0cmliUG9pbnRlciIsImVuYWJsZVZlcnRleEF0dHJpYkFycmF5IiwiZ2V0U3BoZXJlIiwicmFkaXVzIiwibGF0aXR1ZGVCYW5kcyIsImxvbmdpdHVkZUJhbmRzIiwidmVydGljZXMiLCJ0ZXh0dXJlcyIsIm5vcm1hbHMiLCJsYXROdW1iZXIiLCJ0aGV0YSIsIk1hdGgiLCJQSSIsInNpblRoZXRhIiwic2luIiwiY29zVGhldGEiLCJjb3MiLCJsb25nTnVtYmVyIiwicGhpIiwic2luUGhpIiwiY29zUGhpIiwieCIsInkiLCJ6IiwidSIsInYiLCJwdXNoIiwiZmlyc3QiLCJzZWNvbmQiLCJFUFNJTE9OIiwiQVJSQVlfVFlQRSIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiUkFORE9NIiwicmFuZG9tIiwiY3JlYXRlIiwib3V0IiwiZ2xNYXRyaXgiLCJtdWx0aXBseSIsImEiLCJiIiwiYTAwIiwiYTAxIiwiYTAyIiwiYTAzIiwiYTEwIiwiYTExIiwiYTEyIiwiYTEzIiwiYTIwIiwiYTIxIiwiYTIyIiwiYTIzIiwiYTMwIiwiYTMxIiwiYTMyIiwiYTMzIiwiYjAiLCJiMSIsImIyIiwiYjMiLCJwZXJzcGVjdGl2ZSIsImZvdnkiLCJhc3BlY3QiLCJuZWFyIiwiZmFyIiwiZiIsInRhbiIsIm5mIiwiSW5maW5pdHkiLCJpZGVudGl0eSIsImNsb25lIiwibWF0IiwiZnJvbVRyYW5zbGF0aW9uIiwiZnJvbVlSb3RhdGlvbiIsInJhZCIsInMiLCJjIiwibG9va0F0IiwiZXllIiwiY2VudGVyIiwidXAiLCJ4MCIsIngxIiwieDIiLCJ5MCIsInkxIiwieTIiLCJ6MCIsInoxIiwiejIiLCJsZW4iLCJleWV4IiwiZXlleSIsImV5ZXoiLCJ1cHgiLCJ1cHkiLCJ1cHoiLCJjZW50ZXJ4IiwiY2VudGVyeSIsImNlbnRlcnoiLCJhYnMiLCJzcXJ0IiwiZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSIsInEiLCJ3IiwieHgiLCJ4eSIsInh6IiwieXkiLCJ5eiIsInp6Iiwid3giLCJ3eSIsInd6Iiwic3giLCJzeSIsInN6IiwiZnJvbVhSb3RhdGlvbiIsInRhcmdldFRvIiwidGFyZ2V0IiwidHJhbnNwb3NlIiwiaW52ZXJ0IiwiYjAwIiwiYjAxIiwiYjAyIiwiYjAzIiwiYjA0IiwiYjA1IiwiYjA2IiwiYjA3IiwiYjA4IiwiYjA5IiwiYjEwIiwiYjExIiwiZGV0IiwiYWRkIiwicm90YXRlWiIsInAiLCJyIiwicm90YXRlWSIsInRyYW5zZm9ybU1hdDQiLCJtIiwibm9ybWFsaXplIiwiY3Jvc3MiLCJheCIsImF5IiwiYXoiLCJieCIsImJ5IiwiYnoiLCJjbGFtcCIsInZhbHVlIiwibWluIiwibWF4IiwicmFuZ2UiLCJjYWxjdWxhdGVDaXJjbGVDZW50ZXIiLCJBIiwiQiIsIkMiLCJ5RGVsdGFfYSIsInhEZWx0YV9hIiwieURlbHRhX2IiLCJ4RGVsdGFfYiIsImFTbG9wZSIsImJTbG9wZSIsIm1peCIsImRlZ1RvUmFkIiwicmFkVG9EZWciLCJDYW1lcmEiLCJ3aWR0aCIsImhlaWdodCIsImZvdiIsInBvc2l0aW9uIiwibG9va0F0UG9zaXRpb24iLCJfdmlld01hdHJpeCIsIm1hdDQiLCJfcHJvamVjdGlvbk1hdHJpeCIsInVwZGF0ZVBlcnNwZWN0aXZlIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Q0FBTyxJQUFNQSxRQUFRLE1BQWQ7O0NDRVA7Ozs7Ozs7OztBQVNBLENBQU8sU0FBU0MsbUJBQVQsQ0FBNkJDLEVBQTdCLEVBQWlDQyxPQUFqQyxFQUEwQ0MsR0FBMUMsRUFBK0M7Q0FDckQsS0FBSUMsWUFBWSxFQUFoQjs7Q0FFQSxNQUFLLElBQUlDLEtBQUssQ0FBZCxFQUFpQkEsS0FBS0YsSUFBSUcsTUFBMUIsRUFBa0NELElBQWxDLEVBQXdDO0NBQ3ZDLE1BQUlFLE9BQU9KLElBQUlFLEVBQUosQ0FBWDtDQUNBLE1BQUlHLGtCQUFrQlAsR0FBR1Esa0JBQUgsQ0FBc0JQLE9BQXRCLEVBQStCSyxJQUEvQixDQUF0QjtDQUNBSCxZQUFVRyxJQUFWLElBQWtCQyxlQUFsQjtDQUNBOztDQUVELFFBQU9KLFNBQVA7Q0FDQTs7Q0FFRDs7OztBQUlBLENBQU8sU0FBU00sY0FBVCxDQUF3QkMsTUFBeEIsRUFBZ0M7Q0FDdEMsS0FBSUMsUUFBUUQsT0FBT0UsS0FBUCxDQUFhLElBQWIsQ0FBWjs7Q0FFQSxNQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsTUFBTU4sTUFBMUIsRUFBa0NRLEdBQWxDLEVBQXVDO0NBQ3RDRixRQUFNRSxDQUFOLElBQVdBLElBQUksQ0FBSixHQUFRLElBQVIsR0FBZUYsTUFBTUUsQ0FBTixDQUExQjtDQUNBOztDQUVELFFBQU9GLE1BQU1HLElBQU4sQ0FBVyxJQUFYLENBQVA7Q0FDQTs7Q0FFRDs7Ozs7OztBQU9BLENBQU8sU0FBU0MsZUFBVCxDQUF5QmYsRUFBekIsRUFBNkJnQixJQUE3QixFQUFtQ0MsWUFBbkMsRUFBaUQ7Q0FDdkQsS0FBSUMsU0FBU2xCLEdBQUdtQixZQUFILENBQWdCSCxJQUFoQixDQUFiOztDQUVBaEIsSUFBR2lCLFlBQUgsQ0FBZ0JDLE1BQWhCLEVBQXdCRCxZQUF4QjtDQUNBakIsSUFBR29CLGFBQUgsQ0FBaUJGLE1BQWpCOztDQUVBLEtBQUlsQixHQUFHcUIsa0JBQUgsQ0FBc0JILE1BQXRCLEVBQThCbEIsR0FBR3NCLGNBQWpDLENBQUosRUFBc0Q7Q0FDckQsU0FBT0osTUFBUDtDQUNBLEVBRkQsTUFFTztDQUNOSyxVQUFRQyxLQUFSLENBQWMseUNBQWQ7O0NBRUEsTUFBSXhCLEdBQUd5QixnQkFBSCxDQUFvQlAsTUFBcEIsTUFBZ0MsRUFBcEMsRUFBd0M7Q0FDdkNLLFdBQVFHLElBQVIsQ0FDQyxzQ0FERCxFQUVDVixTQUFTaEIsR0FBRzJCLGFBQVosR0FBNEIsUUFBNUIsR0FBdUMsVUFGeEMsRUFHQzNCLEdBQUd5QixnQkFBSCxDQUFvQlAsTUFBcEIsQ0FIRCxFQUlDVCxlQUFlUSxZQUFmLENBSkQ7O0NBT0EsVUFBTyxJQUFQO0NBQ0E7Q0FDRDtDQUNEOztDQUVEOzs7Ozs7Ozs7QUFTQSxDQUFPLFNBQVNXLGFBQVQsQ0FBdUI1QixFQUF2QixFQUEyQjZCLGVBQTNCLEVBQTRDQyxpQkFBNUMsRUFBK0Q7Q0FDckUsS0FBTTdCLFVBQVVELEdBQUcrQixhQUFILEVBQWhCOztDQUVBLEtBQU1DLGVBQWVqQixnQkFBZ0JmLEVBQWhCLEVBQW9CQSxHQUFHMkIsYUFBdkIsRUFBc0NFLGVBQXRDLENBQXJCO0NBQ0EsS0FBTUksaUJBQWlCbEIsZ0JBQWdCZixFQUFoQixFQUFvQkEsR0FBR2tDLGVBQXZCLEVBQXdDSixpQkFBeEMsQ0FBdkI7O0NBRUE5QixJQUFHbUMsWUFBSCxDQUFnQmxDLE9BQWhCLEVBQXlCK0IsWUFBekI7Q0FDQWhDLElBQUdtQyxZQUFILENBQWdCbEMsT0FBaEIsRUFBeUJnQyxjQUF6QjtDQUNBakMsSUFBR29DLFdBQUgsQ0FBZW5DLE9BQWY7O0NBRUEsS0FBSTtDQUNILE1BQUlvQyxVQUFVckMsR0FBR3NDLG1CQUFILENBQXVCckMsT0FBdkIsRUFBZ0NELEdBQUd1QyxXQUFuQyxDQUFkO0NBQ0EsTUFBSSxDQUFDRixPQUFMLEVBQWMsTUFBTXJDLEdBQUd3QyxpQkFBSCxDQUFxQnZDLE9BQXJCLENBQU47Q0FDZCxFQUhELENBR0UsT0FBT3VCLEtBQVAsRUFBYztDQUNmRCxVQUFRQyxLQUFSLG9CQUErQkEsS0FBL0I7Q0FDQTs7Q0FFRCxRQUFPdkIsT0FBUDtDQUNBOztDQUVEOzs7Ozs7Ozs7O0FBVUEsQ0FBTyxTQUFTd0MsV0FBVCxDQUFxQnpDLEVBQXJCLEVBQXlCQyxPQUF6QixFQUFrQ3lDLElBQWxDLEVBQXdDQyxHQUF4QyxFQUE2QztDQUNuRCxLQUFNQyxTQUFTNUMsR0FBRzZDLFlBQUgsRUFBZjtDQUNBLEtBQU1DLFdBQVc5QyxHQUFHK0MsaUJBQUgsQ0FBcUI5QyxPQUFyQixFQUE4QjBDLEdBQTlCLENBQWpCOztDQUVBM0MsSUFBR2dELFVBQUgsQ0FBY2hELEdBQUdpRCxZQUFqQixFQUErQkwsTUFBL0I7Q0FDQTVDLElBQUdrRCxVQUFILENBQWNsRCxHQUFHaUQsWUFBakIsRUFBK0JQLElBQS9CLEVBQXFDMUMsR0FBR21ELFdBQXhDOztDQUVBLFFBQU8sRUFBRVAsY0FBRixFQUFVRSxrQkFBVixFQUFQO0NBQ0E7O0NBRUQ7Ozs7Ozs7Ozs7QUFVQSxDQUFPLFNBQVNNLFdBQVQsQ0FBcUJwRCxFQUFyQixFQUF5QnFELE9BQXpCLEVBQWtDO0NBQ3hDLEtBQU1ULFNBQVM1QyxHQUFHNkMsWUFBSCxFQUFmO0NBQ0E3QyxJQUFHZ0QsVUFBSCxDQUFjaEQsR0FBR3NELG9CQUFqQixFQUF1Q1YsTUFBdkM7Q0FDQTVDLElBQUdrRCxVQUFILENBQWNsRCxHQUFHc0Qsb0JBQWpCLEVBQXVDRCxPQUF2QyxFQUFnRHJELEdBQUdtRCxXQUFuRDs7Q0FFQSxLQUFNSSxNQUFNRixRQUFRaEQsTUFBcEI7Q0FDQSxRQUFPLEVBQUVrRCxRQUFGLEVBQU9YLGNBQVAsRUFBUDtDQUNBOztDQUVEOzs7Ozs7Ozs7O0FBVUEsQ0FBTyxTQUFTSSxVQUFULENBQ05oRCxFQURNLEVBRU40QyxNQUZNLEVBU0w7Q0FBQSxLQU5ERSxRQU1DLHVFQU5VLENBTVY7Q0FBQSxLQUxEVSxJQUtDLHVFQUxNLENBS047Q0FBQSxLQUpEeEMsSUFJQyx1RUFKTWxCLEtBSU47Q0FBQSxLQUhEMkQsVUFHQyx1RUFIWSxLQUdaO0NBQUEsS0FGREMsTUFFQyx1RUFGUSxDQUVSO0NBQUEsS0FEREMsTUFDQyx1RUFEUSxDQUNSOztDQUNEM0QsSUFBR2dELFVBQUgsQ0FBY2hELEdBQUdpRCxZQUFqQixFQUErQkwsTUFBL0I7Q0FDQTVDLElBQUc0RCxtQkFBSCxDQUF1QmQsUUFBdkIsRUFBaUNVLElBQWpDLEVBQXVDeEMsSUFBdkMsRUFBNkN5QyxVQUE3QyxFQUF5REMsTUFBekQsRUFBaUVDLE1BQWpFO0NBQ0EzRCxJQUFHNkQsdUJBQUgsQ0FBMkJmLFFBQTNCO0NBQ0E7O0NDL0pNLFNBQVNnQixTQUFULEdBQXdFO0NBQUEsS0FBckRDLE1BQXFELHVFQUE1QyxDQUE0QztDQUFBLEtBQXpDQyxhQUF5Qyx1RUFBekIsRUFBeUI7Q0FBQSxLQUFyQkMsY0FBcUIsdUVBQUosRUFBSTs7Q0FDOUUsS0FBSUMsV0FBVyxFQUFmO0NBQ0EsS0FBSUMsV0FBVyxFQUFmO0NBQ0EsS0FBSUMsVUFBVSxFQUFkO0NBQ0EsS0FBSWYsVUFBVSxFQUFkOztDQUVBLE1BQUssSUFBSWdCLFlBQVksQ0FBckIsRUFBd0JBLGFBQWFMLGFBQXJDLEVBQW9ELEVBQUVLLFNBQXRELEVBQWlFO0NBQ2hFLE1BQUlDLFFBQVNELFlBQVlFLEtBQUtDLEVBQWxCLEdBQXdCUixhQUFwQztDQUNBLE1BQUlTLFdBQVdGLEtBQUtHLEdBQUwsQ0FBU0osS0FBVCxDQUFmO0NBQ0EsTUFBSUssV0FBV0osS0FBS0ssR0FBTCxDQUFTTixLQUFULENBQWY7O0NBRUEsT0FBSyxJQUFJTyxhQUFhLENBQXRCLEVBQXlCQSxjQUFjWixjQUF2QyxFQUF1RCxFQUFFWSxVQUF6RCxFQUFxRTtDQUNwRSxPQUFJQyxNQUFPRCxhQUFhLENBQWIsR0FBaUJOLEtBQUtDLEVBQXZCLEdBQTZCUCxjQUF2QztDQUNBLE9BQUljLFNBQVNSLEtBQUtHLEdBQUwsQ0FBU0ksR0FBVCxDQUFiO0NBQ0EsT0FBSUUsU0FBU1QsS0FBS0ssR0FBTCxDQUFTRSxHQUFULENBQWI7O0NBRUEsT0FBSUcsSUFBSUQsU0FBU1AsUUFBakI7Q0FDQSxPQUFJUyxJQUFJUCxRQUFSO0NBQ0EsT0FBSVEsSUFBSUosU0FBU04sUUFBakI7Q0FDQSxPQUFJVyxJQUFJLElBQUlQLGFBQWFaLGNBQXpCO0NBQ0EsT0FBSW9CLElBQUksSUFBSWhCLFlBQVlMLGFBQXhCOztDQUVBSSxXQUFRa0IsSUFBUixDQUFhTCxDQUFiLEVBQWdCQyxDQUFoQixFQUFtQkMsQ0FBbkI7Q0FDQWhCLFlBQVNtQixJQUFULENBQWNGLENBQWQsRUFBaUJDLENBQWpCO0NBQ0FuQixZQUFTb0IsSUFBVCxDQUFjdkIsU0FBU2tCLENBQXZCLEVBQTBCbEIsU0FBU21CLENBQW5DLEVBQXNDbkIsU0FBU29CLENBQS9DO0NBQ0E7Q0FDRDs7Q0FFRCxNQUFLZCxZQUFZLENBQWpCLEVBQW9CQSxZQUFZTCxhQUFoQyxFQUErQyxFQUFFSyxTQUFqRCxFQUE0RDtDQUMzRCxPQUFLUSxhQUFhLENBQWxCLEVBQXFCQSxhQUFhWixjQUFsQyxFQUFrRCxFQUFFWSxVQUFwRCxFQUFnRTtDQUMvRCxPQUFJVSxRQUFRbEIsYUFBYUosaUJBQWlCLENBQTlCLElBQW1DWSxVQUEvQztDQUNBLE9BQUlXLFNBQVNELFFBQVF0QixjQUFSLEdBQXlCLENBQXRDO0NBQ0FaLFdBQVFpQyxJQUFSLENBQWFFLE1BQWIsRUFBcUJELEtBQXJCLEVBQTRCQSxRQUFRLENBQXBDLEVBQXVDQyxTQUFTLENBQWhELEVBQW1EQSxNQUFuRCxFQUEyREQsUUFBUSxDQUFuRTtDQUNBO0NBQ0Q7O0NBRUQsUUFBTztDQUNOckIsWUFBVUEsUUFESjtDQUVOQyxZQUFVQSxRQUZKO0NBR05DLFdBQVNBLE9BSEg7Q0FJTmYsV0FBU0E7Q0FKSCxFQUFQO0NBTUE7O0NDMUNNLElBQU1vQyxVQUFVLFFBQWhCO0FBQ1AsQ0FBTyxJQUFJQyxhQUFhLE9BQU9DLFlBQVAsS0FBd0IsV0FBeEIsR0FBc0NBLFlBQXRDLEdBQXFEQyxLQUF0RTtBQUNQLENBQU8sSUFBTUMsU0FBU3RCLEtBQUt1QixNQUFwQjs7Ozs7Ozs7Q0NBQSxTQUFTQyxNQUFULEdBQWtCO0NBQ3hCLEtBQUlDLE1BQU0sSUFBSUMsVUFBSixDQUF3QixFQUF4QixDQUFWO0NBQ0EsS0FBSUEsVUFBQSxJQUF1Qk4sWUFBM0IsRUFBeUM7Q0FDeENLLE1BQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxNQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLE1BQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxNQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLE1BQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxNQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLE1BQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsTUFBSSxFQUFKLElBQVUsQ0FBVjtDQUNBQSxNQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0E7Q0FDREEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBLFFBQU9BLEdBQVA7Q0FDQTs7QUFFRCxDQUFPLFNBQVNFLFFBQVQsQ0FBa0JGLEdBQWxCLEVBQXVCRyxDQUF2QixFQUEwQkMsQ0FBMUIsRUFBNkI7Q0FDbkMsS0FBSUMsTUFBTUYsRUFBRSxDQUFGLENBQVY7Q0FBQSxLQUNDRyxNQUFNSCxFQUFFLENBQUYsQ0FEUDtDQUFBLEtBRUNJLE1BQU1KLEVBQUUsQ0FBRixDQUZQO0NBQUEsS0FHQ0ssTUFBTUwsRUFBRSxDQUFGLENBSFA7Q0FJQSxLQUFJTSxNQUFNTixFQUFFLENBQUYsQ0FBVjtDQUFBLEtBQ0NPLE1BQU1QLEVBQUUsQ0FBRixDQURQO0NBQUEsS0FFQ1EsTUFBTVIsRUFBRSxDQUFGLENBRlA7Q0FBQSxLQUdDUyxNQUFNVCxFQUFFLENBQUYsQ0FIUDtDQUlBLEtBQUlVLE1BQU1WLEVBQUUsQ0FBRixDQUFWO0NBQUEsS0FDQ1csTUFBTVgsRUFBRSxDQUFGLENBRFA7Q0FBQSxLQUVDWSxNQUFNWixFQUFFLEVBQUYsQ0FGUDtDQUFBLEtBR0NhLE1BQU1iLEVBQUUsRUFBRixDQUhQO0NBSUEsS0FBSWMsTUFBTWQsRUFBRSxFQUFGLENBQVY7Q0FBQSxLQUNDZSxNQUFNZixFQUFFLEVBQUYsQ0FEUDtDQUFBLEtBRUNnQixNQUFNaEIsRUFBRSxFQUFGLENBRlA7Q0FBQSxLQUdDaUIsTUFBTWpCLEVBQUUsRUFBRixDQUhQO0NBSUE7Q0FDQSxLQUFJa0IsS0FBS2pCLEVBQUUsQ0FBRixDQUFUO0NBQUEsS0FDQ2tCLEtBQUtsQixFQUFFLENBQUYsQ0FETjtDQUFBLEtBRUNtQixLQUFLbkIsRUFBRSxDQUFGLENBRk47Q0FBQSxLQUdDb0IsS0FBS3BCLEVBQUUsQ0FBRixDQUhOO0NBSUFKLEtBQUksQ0FBSixJQUFTcUIsS0FBS2hCLEdBQUwsR0FBV2lCLEtBQUtiLEdBQWhCLEdBQXNCYyxLQUFLVixHQUEzQixHQUFpQ1csS0FBS1AsR0FBL0M7Q0FDQWpCLEtBQUksQ0FBSixJQUFTcUIsS0FBS2YsR0FBTCxHQUFXZ0IsS0FBS1osR0FBaEIsR0FBc0JhLEtBQUtULEdBQTNCLEdBQWlDVSxLQUFLTixHQUEvQztDQUNBbEIsS0FBSSxDQUFKLElBQVNxQixLQUFLZCxHQUFMLEdBQVdlLEtBQUtYLEdBQWhCLEdBQXNCWSxLQUFLUixHQUEzQixHQUFpQ1MsS0FBS0wsR0FBL0M7Q0FDQW5CLEtBQUksQ0FBSixJQUFTcUIsS0FBS2IsR0FBTCxHQUFXYyxLQUFLVixHQUFoQixHQUFzQlcsS0FBS1AsR0FBM0IsR0FBaUNRLEtBQUtKLEdBQS9DO0NBQ0FDLE1BQUtqQixFQUFFLENBQUYsQ0FBTDtDQUNBa0IsTUFBS2xCLEVBQUUsQ0FBRixDQUFMO0NBQ0FtQixNQUFLbkIsRUFBRSxDQUFGLENBQUw7Q0FDQW9CLE1BQUtwQixFQUFFLENBQUYsQ0FBTDtDQUNBSixLQUFJLENBQUosSUFBU3FCLEtBQUtoQixHQUFMLEdBQVdpQixLQUFLYixHQUFoQixHQUFzQmMsS0FBS1YsR0FBM0IsR0FBaUNXLEtBQUtQLEdBQS9DO0NBQ0FqQixLQUFJLENBQUosSUFBU3FCLEtBQUtmLEdBQUwsR0FBV2dCLEtBQUtaLEdBQWhCLEdBQXNCYSxLQUFLVCxHQUEzQixHQUFpQ1UsS0FBS04sR0FBL0M7Q0FDQWxCLEtBQUksQ0FBSixJQUFTcUIsS0FBS2QsR0FBTCxHQUFXZSxLQUFLWCxHQUFoQixHQUFzQlksS0FBS1IsR0FBM0IsR0FBaUNTLEtBQUtMLEdBQS9DO0NBQ0FuQixLQUFJLENBQUosSUFBU3FCLEtBQUtiLEdBQUwsR0FBV2MsS0FBS1YsR0FBaEIsR0FBc0JXLEtBQUtQLEdBQTNCLEdBQWlDUSxLQUFLSixHQUEvQztDQUNBQyxNQUFLakIsRUFBRSxDQUFGLENBQUw7Q0FDQWtCLE1BQUtsQixFQUFFLENBQUYsQ0FBTDtDQUNBbUIsTUFBS25CLEVBQUUsRUFBRixDQUFMO0NBQ0FvQixNQUFLcEIsRUFBRSxFQUFGLENBQUw7Q0FDQUosS0FBSSxDQUFKLElBQVNxQixLQUFLaEIsR0FBTCxHQUFXaUIsS0FBS2IsR0FBaEIsR0FBc0JjLEtBQUtWLEdBQTNCLEdBQWlDVyxLQUFLUCxHQUEvQztDQUNBakIsS0FBSSxDQUFKLElBQVNxQixLQUFLZixHQUFMLEdBQVdnQixLQUFLWixHQUFoQixHQUFzQmEsS0FBS1QsR0FBM0IsR0FBaUNVLEtBQUtOLEdBQS9DO0NBQ0FsQixLQUFJLEVBQUosSUFBVXFCLEtBQUtkLEdBQUwsR0FBV2UsS0FBS1gsR0FBaEIsR0FBc0JZLEtBQUtSLEdBQTNCLEdBQWlDUyxLQUFLTCxHQUFoRDtDQUNBbkIsS0FBSSxFQUFKLElBQVVxQixLQUFLYixHQUFMLEdBQVdjLEtBQUtWLEdBQWhCLEdBQXNCVyxLQUFLUCxHQUEzQixHQUFpQ1EsS0FBS0osR0FBaEQ7Q0FDQUMsTUFBS2pCLEVBQUUsRUFBRixDQUFMO0NBQ0FrQixNQUFLbEIsRUFBRSxFQUFGLENBQUw7Q0FDQW1CLE1BQUtuQixFQUFFLEVBQUYsQ0FBTDtDQUNBb0IsTUFBS3BCLEVBQUUsRUFBRixDQUFMO0NBQ0FKLEtBQUksRUFBSixJQUFVcUIsS0FBS2hCLEdBQUwsR0FBV2lCLEtBQUtiLEdBQWhCLEdBQXNCYyxLQUFLVixHQUEzQixHQUFpQ1csS0FBS1AsR0FBaEQ7Q0FDQWpCLEtBQUksRUFBSixJQUFVcUIsS0FBS2YsR0FBTCxHQUFXZ0IsS0FBS1osR0FBaEIsR0FBc0JhLEtBQUtULEdBQTNCLEdBQWlDVSxLQUFLTixHQUFoRDtDQUNBbEIsS0FBSSxFQUFKLElBQVVxQixLQUFLZCxHQUFMLEdBQVdlLEtBQUtYLEdBQWhCLEdBQXNCWSxLQUFLUixHQUEzQixHQUFpQ1MsS0FBS0wsR0FBaEQ7Q0FDQW5CLEtBQUksRUFBSixJQUFVcUIsS0FBS2IsR0FBTCxHQUFXYyxLQUFLVixHQUFoQixHQUFzQlcsS0FBS1AsR0FBM0IsR0FBaUNRLEtBQUtKLEdBQWhEO0NBQ0EsUUFBT3BCLEdBQVA7Q0FDQTs7QUFFRCxDQUFPLFNBQVN5QixXQUFULENBQXFCekIsR0FBckIsRUFBMEIwQixJQUExQixFQUFnQ0MsTUFBaEMsRUFBd0NDLElBQXhDLEVBQThDQyxHQUE5QyxFQUFtRDtDQUN6RCxLQUFJQyxJQUFJLE1BQU12RCxLQUFLd0QsR0FBTCxDQUFTTCxPQUFPLENBQWhCLENBQWQ7Q0FBQSxLQUNDTSxXQUREO0NBRUFoQyxLQUFJLENBQUosSUFBUzhCLElBQUlILE1BQWI7Q0FDQTNCLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVM4QixDQUFUO0NBQ0E5QixLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksRUFBSixJQUFVLENBQUMsQ0FBWDtDQUNBQSxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBLEtBQUk2QixPQUFPLElBQVAsSUFBZUEsUUFBUUksUUFBM0IsRUFBcUM7Q0FDcENELE9BQUssS0FBS0osT0FBT0MsR0FBWixDQUFMO0NBQ0E3QixNQUFJLEVBQUosSUFBVSxDQUFDNkIsTUFBTUQsSUFBUCxJQUFlSSxFQUF6QjtDQUNBaEMsTUFBSSxFQUFKLElBQVUsSUFBSTZCLEdBQUosR0FBVUQsSUFBVixHQUFpQkksRUFBM0I7Q0FDQSxFQUpELE1BSU87Q0FDTmhDLE1BQUksRUFBSixJQUFVLENBQUMsQ0FBWDtDQUNBQSxNQUFJLEVBQUosSUFBVSxDQUFDLENBQUQsR0FBSzRCLElBQWY7Q0FDQTtDQUNELFFBQU81QixHQUFQO0NBQ0E7O0FBRUQsQ0FBTyxTQUFTa0MsUUFBVCxDQUFrQmxDLEdBQWxCLEVBQXVCO0NBQzdCQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBQSxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBQSxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0EsUUFBT0EsR0FBUDtDQUNBOztBQUVELENBQU8sU0FBU21DLEtBQVQsQ0FBZUMsR0FBZixFQUFvQjtDQUMxQixLQUFJcEMsTUFBTSxJQUFJQyxVQUFKLENBQXdCLEVBQXhCLENBQVY7Q0FDQSxNQUFLLElBQUk3RixLQUFLLENBQWQsRUFBaUJBLEtBQUs0RixJQUFJM0YsTUFBMUIsRUFBa0NELElBQWxDLEVBQXdDO0NBQ3ZDNEYsTUFBSTVGLEVBQUosSUFBVWdJLElBQUloSSxFQUFKLENBQVY7Q0FDQTs7Q0FFRCxRQUFPNEYsR0FBUDtDQUNBOztBQUVELENBQU8sU0FBU3FDLGVBQVQsQ0FBeUJyQyxHQUF6QixFQUE4QlgsQ0FBOUIsRUFBaUM7Q0FDdkNXLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBQSxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLEtBQUksRUFBSixJQUFVWCxFQUFFLENBQUYsQ0FBVjtDQUNBVyxLQUFJLEVBQUosSUFBVVgsRUFBRSxDQUFGLENBQVY7Q0FDQVcsS0FBSSxFQUFKLElBQVVYLEVBQUUsQ0FBRixDQUFWO0NBQ0FXLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQSxRQUFPQSxHQUFQO0NBQ0E7O0FBRUQsQ0FBTyxTQUFTc0MsYUFBVCxDQUF1QnRDLEdBQXZCLEVBQTRCdUMsR0FBNUIsRUFBaUM7Q0FDdkMsS0FBSUMsSUFBSWpFLEtBQUtHLEdBQUwsQ0FBUzZELEdBQVQsQ0FBUjtDQUNBLEtBQUlFLElBQUlsRSxLQUFLSyxHQUFMLENBQVMyRCxHQUFULENBQVI7Q0FDQTs7Q0FFQXZDLEtBQUksQ0FBSixJQUFTeUMsQ0FBVDtDQUNBekMsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFDd0MsQ0FBVjtDQUNBeEMsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTd0MsQ0FBVDtDQUNBeEMsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLEVBQUosSUFBVXlDLENBQVY7Q0FDQXpDLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBQSxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjs7Q0FFQSxRQUFPQSxHQUFQO0NBQ0E7O0FBRUQsQ0FBTyxTQUFTMEMsTUFBVCxDQUFnQjFDLEdBQWhCLEVBQXFCMkMsR0FBckIsRUFBMEJDLE1BQTFCLEVBQWtDQyxFQUFsQyxFQUFzQztDQUM1QyxLQUFJQyxXQUFKO0NBQUEsS0FBUUMsV0FBUjtDQUFBLEtBQVlDLFdBQVo7Q0FBQSxLQUFnQkMsV0FBaEI7Q0FBQSxLQUFvQkMsV0FBcEI7Q0FBQSxLQUF3QkMsV0FBeEI7Q0FBQSxLQUE0QkMsV0FBNUI7Q0FBQSxLQUFnQ0MsV0FBaEM7Q0FBQSxLQUFvQ0MsV0FBcEM7Q0FBQSxLQUF3Q0MsWUFBeEM7Q0FDQSxLQUFJQyxPQUFPYixJQUFJLENBQUosQ0FBWDtDQUNBLEtBQUljLE9BQU9kLElBQUksQ0FBSixDQUFYO0NBQ0EsS0FBSWUsT0FBT2YsSUFBSSxDQUFKLENBQVg7Q0FDQSxLQUFJZ0IsTUFBTWQsR0FBRyxDQUFILENBQVY7Q0FDQSxLQUFJZSxNQUFNZixHQUFHLENBQUgsQ0FBVjtDQUNBLEtBQUlnQixNQUFNaEIsR0FBRyxDQUFILENBQVY7Q0FDQSxLQUFJaUIsVUFBVWxCLE9BQU8sQ0FBUCxDQUFkO0NBQ0EsS0FBSW1CLFVBQVVuQixPQUFPLENBQVAsQ0FBZDtDQUNBLEtBQUlvQixVQUFVcEIsT0FBTyxDQUFQLENBQWQ7O0NBRUEsS0FDQ3JFLEtBQUswRixHQUFMLENBQVNULE9BQU9NLE9BQWhCLElBQTJCN0QsT0FBM0IsSUFDQTFCLEtBQUswRixHQUFMLENBQVNSLE9BQU9NLE9BQWhCLElBQTJCOUQsT0FEM0IsSUFFQTFCLEtBQUswRixHQUFMLENBQVNQLE9BQU9NLE9BQWhCLElBQTJCL0QsT0FINUIsRUFJRTtDQUNELFNBQU9pQyxTQUFTbEMsR0FBVCxDQUFQO0NBQ0E7O0NBRURvRCxNQUFLSSxPQUFPTSxPQUFaO0NBQ0FULE1BQUtJLE9BQU9NLE9BQVo7Q0FDQVQsTUFBS0ksT0FBT00sT0FBWjs7Q0FFQVQsT0FBTSxJQUFJaEYsS0FBSzJGLElBQUwsQ0FBVWQsS0FBS0EsRUFBTCxHQUFVQyxLQUFLQSxFQUFmLEdBQW9CQyxLQUFLQSxFQUFuQyxDQUFWO0NBQ0FGLE9BQU1HLEdBQU47Q0FDQUYsT0FBTUUsR0FBTjtDQUNBRCxPQUFNQyxHQUFOOztDQUVBVCxNQUFLYyxNQUFNTixFQUFOLEdBQVdPLE1BQU1SLEVBQXRCO0NBQ0FOLE1BQUtjLE1BQU1ULEVBQU4sR0FBV08sTUFBTUwsRUFBdEI7Q0FDQU4sTUFBS1csTUFBTU4sRUFBTixHQUFXTyxNQUFNUixFQUF0QjtDQUNBRyxPQUFNaEYsS0FBSzJGLElBQUwsQ0FBVXBCLEtBQUtBLEVBQUwsR0FBVUMsS0FBS0EsRUFBZixHQUFvQkMsS0FBS0EsRUFBbkMsQ0FBTjtDQUNBLEtBQUksQ0FBQ08sR0FBTCxFQUFVO0NBQ1RULE9BQUssQ0FBTDtDQUNBQyxPQUFLLENBQUw7Q0FDQUMsT0FBSyxDQUFMO0NBQ0EsRUFKRCxNQUlPO0NBQ05PLFFBQU0sSUFBSUEsR0FBVjtDQUNBVCxRQUFNUyxHQUFOO0NBQ0FSLFFBQU1RLEdBQU47Q0FDQVAsUUFBTU8sR0FBTjtDQUNBOztDQUVETixNQUFLSSxLQUFLTCxFQUFMLEdBQVVNLEtBQUtQLEVBQXBCO0NBQ0FHLE1BQUtJLEtBQUtSLEVBQUwsR0FBVU0sS0FBS0osRUFBcEI7Q0FDQUcsTUFBS0MsS0FBS0wsRUFBTCxHQUFVTSxLQUFLUCxFQUFwQjs7Q0FFQVMsT0FBTWhGLEtBQUsyRixJQUFMLENBQVVqQixLQUFLQSxFQUFMLEdBQVVDLEtBQUtBLEVBQWYsR0FBb0JDLEtBQUtBLEVBQW5DLENBQU47Q0FDQSxLQUFJLENBQUNJLEdBQUwsRUFBVTtDQUNUTixPQUFLLENBQUw7Q0FDQUMsT0FBSyxDQUFMO0NBQ0FDLE9BQUssQ0FBTDtDQUNBLEVBSkQsTUFJTztDQUNOSSxRQUFNLElBQUlBLEdBQVY7Q0FDQU4sUUFBTU0sR0FBTjtDQUNBTCxRQUFNSyxHQUFOO0NBQ0FKLFFBQU1JLEdBQU47Q0FDQTs7Q0FFRHZELEtBQUksQ0FBSixJQUFTOEMsRUFBVDtDQUNBOUMsS0FBSSxDQUFKLElBQVNpRCxFQUFUO0NBQ0FqRCxLQUFJLENBQUosSUFBU29ELEVBQVQ7Q0FDQXBELEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMrQyxFQUFUO0NBQ0EvQyxLQUFJLENBQUosSUFBU2tELEVBQVQ7Q0FDQWxELEtBQUksQ0FBSixJQUFTcUQsRUFBVDtDQUNBckQsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBU2dELEVBQVQ7Q0FDQWhELEtBQUksQ0FBSixJQUFTbUQsRUFBVDtDQUNBbkQsS0FBSSxFQUFKLElBQVVzRCxFQUFWO0NBQ0F0RCxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLEtBQUksRUFBSixJQUFVLEVBQUU4QyxLQUFLVSxJQUFMLEdBQVlULEtBQUtVLElBQWpCLEdBQXdCVCxLQUFLVSxJQUEvQixDQUFWO0NBQ0ExRCxLQUFJLEVBQUosSUFBVSxFQUFFaUQsS0FBS08sSUFBTCxHQUFZTixLQUFLTyxJQUFqQixHQUF3Qk4sS0FBS08sSUFBL0IsQ0FBVjtDQUNBMUQsS0FBSSxFQUFKLElBQVUsRUFBRW9ELEtBQUtJLElBQUwsR0FBWUgsS0FBS0ksSUFBakIsR0FBd0JILEtBQUtJLElBQS9CLENBQVY7Q0FDQTFELEtBQUksRUFBSixJQUFVLENBQVY7O0NBRUEsUUFBT0EsR0FBUDtDQUNBOztBQUVELENBQU8sU0FBU21FLDRCQUFULENBQXNDbkUsR0FBdEMsRUFBMkNvRSxDQUEzQyxFQUE4Qy9FLENBQTlDLEVBQWlEbUQsQ0FBakQsRUFBb0Q7Q0FDMUQ7Q0FDQSxLQUFJdkQsSUFBSW1GLEVBQUUsQ0FBRixDQUFSO0NBQUEsS0FDQ2xGLElBQUlrRixFQUFFLENBQUYsQ0FETDtDQUFBLEtBRUNqRixJQUFJaUYsRUFBRSxDQUFGLENBRkw7Q0FBQSxLQUdDQyxJQUFJRCxFQUFFLENBQUYsQ0FITDtDQUlBLEtBQUlwQixLQUFLL0QsSUFBSUEsQ0FBYjtDQUNBLEtBQUlrRSxLQUFLakUsSUFBSUEsQ0FBYjtDQUNBLEtBQUlvRSxLQUFLbkUsSUFBSUEsQ0FBYjtDQUNBLEtBQUltRixLQUFLckYsSUFBSStELEVBQWI7Q0FDQSxLQUFJdUIsS0FBS3RGLElBQUlrRSxFQUFiO0NBQ0EsS0FBSXFCLEtBQUt2RixJQUFJcUUsRUFBYjtDQUNBLEtBQUltQixLQUFLdkYsSUFBSWlFLEVBQWI7Q0FDQSxLQUFJdUIsS0FBS3hGLElBQUlvRSxFQUFiO0NBQ0EsS0FBSXFCLEtBQUt4RixJQUFJbUUsRUFBYjtDQUNBLEtBQUlzQixLQUFLUCxJQUFJckIsRUFBYjtDQUNBLEtBQUk2QixLQUFLUixJQUFJbEIsRUFBYjtDQUNBLEtBQUkyQixLQUFLVCxJQUFJZixFQUFiO0NBQ0EsS0FBSXlCLEtBQUt2QyxFQUFFLENBQUYsQ0FBVDtDQUNBLEtBQUl3QyxLQUFLeEMsRUFBRSxDQUFGLENBQVQ7Q0FDQSxLQUFJeUMsS0FBS3pDLEVBQUUsQ0FBRixDQUFUO0NBQ0F4QyxLQUFJLENBQUosSUFBUyxDQUFDLEtBQUt5RSxLQUFLRSxFQUFWLENBQUQsSUFBa0JJLEVBQTNCO0NBQ0EvRSxLQUFJLENBQUosSUFBUyxDQUFDdUUsS0FBS08sRUFBTixJQUFZQyxFQUFyQjtDQUNBL0UsS0FBSSxDQUFKLElBQVMsQ0FBQ3dFLEtBQUtLLEVBQU4sSUFBWUUsRUFBckI7Q0FDQS9FLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBQ3VFLEtBQUtPLEVBQU4sSUFBWUUsRUFBckI7Q0FDQWhGLEtBQUksQ0FBSixJQUFTLENBQUMsS0FBS3NFLEtBQUtLLEVBQVYsQ0FBRCxJQUFrQkssRUFBM0I7Q0FDQWhGLEtBQUksQ0FBSixJQUFTLENBQUMwRSxLQUFLRSxFQUFOLElBQVlJLEVBQXJCO0NBQ0FoRixLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQUN3RSxLQUFLSyxFQUFOLElBQVlJLEVBQXJCO0NBQ0FqRixLQUFJLENBQUosSUFBUyxDQUFDMEUsS0FBS0UsRUFBTixJQUFZSyxFQUFyQjtDQUNBakYsS0FBSSxFQUFKLElBQVUsQ0FBQyxLQUFLc0UsS0FBS0csRUFBVixDQUFELElBQWtCUSxFQUE1QjtDQUNBakYsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBQSxLQUFJLEVBQUosSUFBVVgsRUFBRSxDQUFGLENBQVY7Q0FDQVcsS0FBSSxFQUFKLElBQVVYLEVBQUUsQ0FBRixDQUFWO0NBQ0FXLEtBQUksRUFBSixJQUFVWCxFQUFFLENBQUYsQ0FBVjtDQUNBVyxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0EsUUFBT0EsR0FBUDtDQUNBOztBQUVELENBQU8sU0FBU2tGLGFBQVQsQ0FBdUJsRixHQUF2QixFQUE0QnVDLEdBQTVCLEVBQWlDO0NBQ3ZDLEtBQUlDLElBQUlqRSxLQUFLRyxHQUFMLENBQVM2RCxHQUFULENBQVI7Q0FDQSxLQUFJRSxJQUFJbEUsS0FBS0ssR0FBTCxDQUFTMkQsR0FBVCxDQUFSO0NBQ0E7Q0FDQXZDLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBU3lDLENBQVQ7Q0FDQXpDLEtBQUksQ0FBSixJQUFTd0MsQ0FBVDtDQUNBeEMsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLEtBQUksQ0FBSixJQUFTLENBQUN3QyxDQUFWO0NBQ0F4QyxLQUFJLEVBQUosSUFBVXlDLENBQVY7Q0FDQXpDLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBQSxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQUEsS0FBSSxFQUFKLElBQVUsQ0FBVjtDQUNBLFFBQU9BLEdBQVA7Q0FDQTs7QUFFRCxDQUFPLFNBQVNtRixRQUFULENBQWtCbkYsR0FBbEIsRUFBdUIyQyxHQUF2QixFQUE0QnlDLE1BQTVCLEVBQW9DdkMsRUFBcEMsRUFBd0M7Q0FDOUMsS0FBSVcsT0FBT2IsSUFBSSxDQUFKLENBQVg7Q0FBQSxLQUNDYyxPQUFPZCxJQUFJLENBQUosQ0FEUjtDQUFBLEtBRUNlLE9BQU9mLElBQUksQ0FBSixDQUZSO0NBQUEsS0FHQ2dCLE1BQU1kLEdBQUcsQ0FBSCxDQUhQO0NBQUEsS0FJQ2UsTUFBTWYsR0FBRyxDQUFILENBSlA7Q0FBQSxLQUtDZ0IsTUFBTWhCLEdBQUcsQ0FBSCxDQUxQO0NBTUEsS0FBSU8sS0FBS0ksT0FBTzRCLE9BQU8sQ0FBUCxDQUFoQjtDQUFBLEtBQ0MvQixLQUFLSSxPQUFPMkIsT0FBTyxDQUFQLENBRGI7Q0FBQSxLQUVDOUIsS0FBS0ksT0FBTzBCLE9BQU8sQ0FBUCxDQUZiO0NBR0EsS0FBSTdCLE1BQU1ILEtBQUtBLEVBQUwsR0FBVUMsS0FBS0EsRUFBZixHQUFvQkMsS0FBS0EsRUFBbkM7Q0FDQSxLQUFJQyxNQUFNLENBQVYsRUFBYTtDQUNaQSxRQUFNLElBQUloRixLQUFLMkYsSUFBTCxDQUFVWCxHQUFWLENBQVY7Q0FDQUgsUUFBTUcsR0FBTjtDQUNBRixRQUFNRSxHQUFOO0NBQ0FELFFBQU1DLEdBQU47Q0FDQTtDQUNELEtBQUlULEtBQUtjLE1BQU1OLEVBQU4sR0FBV08sTUFBTVIsRUFBMUI7Q0FBQSxLQUNDTixLQUFLYyxNQUFNVCxFQUFOLEdBQVdPLE1BQU1MLEVBRHZCO0NBQUEsS0FFQ04sS0FBS1csTUFBTU4sRUFBTixHQUFXTyxNQUFNUixFQUZ2QjtDQUdBRyxPQUFNVCxLQUFLQSxFQUFMLEdBQVVDLEtBQUtBLEVBQWYsR0FBb0JDLEtBQUtBLEVBQS9CO0NBQ0EsS0FBSU8sTUFBTSxDQUFWLEVBQWE7Q0FDWkEsUUFBTSxJQUFJaEYsS0FBSzJGLElBQUwsQ0FBVVgsR0FBVixDQUFWO0NBQ0FULFFBQU1TLEdBQU47Q0FDQVIsUUFBTVEsR0FBTjtDQUNBUCxRQUFNTyxHQUFOO0NBQ0E7Q0FDRHZELEtBQUksQ0FBSixJQUFTOEMsRUFBVDtDQUNBOUMsS0FBSSxDQUFKLElBQVMrQyxFQUFUO0NBQ0EvQyxLQUFJLENBQUosSUFBU2dELEVBQVQ7Q0FDQWhELEtBQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsS0FBSSxDQUFKLElBQVNxRCxLQUFLTCxFQUFMLEdBQVVNLEtBQUtQLEVBQXhCO0NBQ0EvQyxLQUFJLENBQUosSUFBU3NELEtBQUtSLEVBQUwsR0FBVU0sS0FBS0osRUFBeEI7Q0FDQWhELEtBQUksQ0FBSixJQUFTb0QsS0FBS0wsRUFBTCxHQUFVTSxLQUFLUCxFQUF4QjtDQUNBOUMsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxLQUFJLENBQUosSUFBU29ELEVBQVQ7Q0FDQXBELEtBQUksQ0FBSixJQUFTcUQsRUFBVDtDQUNBckQsS0FBSSxFQUFKLElBQVVzRCxFQUFWO0NBQ0F0RCxLQUFJLEVBQUosSUFBVSxDQUFWO0NBQ0FBLEtBQUksRUFBSixJQUFVd0QsSUFBVjtDQUNBeEQsS0FBSSxFQUFKLElBQVV5RCxJQUFWO0NBQ0F6RCxLQUFJLEVBQUosSUFBVTBELElBQVY7Q0FDQTFELEtBQUksRUFBSixJQUFVLENBQVY7Q0FDQSxRQUFPQSxHQUFQO0NBQ0E7O0NBRUQ7Ozs7Ozs7QUFPQSxDQUFPLFNBQVNxRixTQUFULENBQW1CckYsR0FBbkIsRUFBd0JHLENBQXhCLEVBQTJCO0NBQ2pDO0NBQ0EsS0FBSUgsUUFBUUcsQ0FBWixFQUFlO0NBQ2QsTUFBSUcsTUFBTUgsRUFBRSxDQUFGLENBQVY7Q0FBQSxNQUNDSSxNQUFNSixFQUFFLENBQUYsQ0FEUDtDQUFBLE1BRUNLLE1BQU1MLEVBQUUsQ0FBRixDQUZQO0NBR0EsTUFBSVEsTUFBTVIsRUFBRSxDQUFGLENBQVY7Q0FBQSxNQUNDUyxNQUFNVCxFQUFFLENBQUYsQ0FEUDtDQUVBLE1BQUlhLE1BQU1iLEVBQUUsRUFBRixDQUFWOztDQUVBSCxNQUFJLENBQUosSUFBU0csRUFBRSxDQUFGLENBQVQ7Q0FDQUgsTUFBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixDQUFUO0NBQ0FILE1BQUksQ0FBSixJQUFTRyxFQUFFLEVBQUYsQ0FBVDtDQUNBSCxNQUFJLENBQUosSUFBU00sR0FBVDtDQUNBTixNQUFJLENBQUosSUFBU0csRUFBRSxDQUFGLENBQVQ7Q0FDQUgsTUFBSSxDQUFKLElBQVNHLEVBQUUsRUFBRixDQUFUO0NBQ0FILE1BQUksQ0FBSixJQUFTTyxHQUFUO0NBQ0FQLE1BQUksQ0FBSixJQUFTVyxHQUFUO0NBQ0FYLE1BQUksRUFBSixJQUFVRyxFQUFFLEVBQUYsQ0FBVjtDQUNBSCxNQUFJLEVBQUosSUFBVVEsR0FBVjtDQUNBUixNQUFJLEVBQUosSUFBVVksR0FBVjtDQUNBWixNQUFJLEVBQUosSUFBVWdCLEdBQVY7Q0FDQSxFQXBCRCxNQW9CTztDQUNOaEIsTUFBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixDQUFUO0NBQ0FILE1BQUksQ0FBSixJQUFTRyxFQUFFLENBQUYsQ0FBVDtDQUNBSCxNQUFJLENBQUosSUFBU0csRUFBRSxDQUFGLENBQVQ7Q0FDQUgsTUFBSSxDQUFKLElBQVNHLEVBQUUsRUFBRixDQUFUO0NBQ0FILE1BQUksQ0FBSixJQUFTRyxFQUFFLENBQUYsQ0FBVDtDQUNBSCxNQUFJLENBQUosSUFBU0csRUFBRSxDQUFGLENBQVQ7Q0FDQUgsTUFBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixDQUFUO0NBQ0FILE1BQUksQ0FBSixJQUFTRyxFQUFFLEVBQUYsQ0FBVDtDQUNBSCxNQUFJLENBQUosSUFBU0csRUFBRSxDQUFGLENBQVQ7Q0FDQUgsTUFBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixDQUFUO0NBQ0FILE1BQUksRUFBSixJQUFVRyxFQUFFLEVBQUYsQ0FBVjtDQUNBSCxNQUFJLEVBQUosSUFBVUcsRUFBRSxFQUFGLENBQVY7Q0FDQUgsTUFBSSxFQUFKLElBQVVHLEVBQUUsQ0FBRixDQUFWO0NBQ0FILE1BQUksRUFBSixJQUFVRyxFQUFFLENBQUYsQ0FBVjtDQUNBSCxNQUFJLEVBQUosSUFBVUcsRUFBRSxFQUFGLENBQVY7Q0FDQUgsTUFBSSxFQUFKLElBQVVHLEVBQUUsRUFBRixDQUFWO0NBQ0E7O0NBRUQsUUFBT0gsR0FBUDtDQUNBOztDQUVEOzs7Ozs7O0FBT0EsQ0FBTyxTQUFTc0YsTUFBVCxDQUFnQnRGLEdBQWhCLEVBQXFCRyxDQUFyQixFQUF3QjtDQUM5QixLQUFJRSxNQUFNRixFQUFFLENBQUYsQ0FBVjtDQUFBLEtBQ0NHLE1BQU1ILEVBQUUsQ0FBRixDQURQO0NBQUEsS0FFQ0ksTUFBTUosRUFBRSxDQUFGLENBRlA7Q0FBQSxLQUdDSyxNQUFNTCxFQUFFLENBQUYsQ0FIUDtDQUlBLEtBQUlNLE1BQU1OLEVBQUUsQ0FBRixDQUFWO0NBQUEsS0FDQ08sTUFBTVAsRUFBRSxDQUFGLENBRFA7Q0FBQSxLQUVDUSxNQUFNUixFQUFFLENBQUYsQ0FGUDtDQUFBLEtBR0NTLE1BQU1ULEVBQUUsQ0FBRixDQUhQO0NBSUEsS0FBSVUsTUFBTVYsRUFBRSxDQUFGLENBQVY7Q0FBQSxLQUNDVyxNQUFNWCxFQUFFLENBQUYsQ0FEUDtDQUFBLEtBRUNZLE1BQU1aLEVBQUUsRUFBRixDQUZQO0NBQUEsS0FHQ2EsTUFBTWIsRUFBRSxFQUFGLENBSFA7Q0FJQSxLQUFJYyxNQUFNZCxFQUFFLEVBQUYsQ0FBVjtDQUFBLEtBQ0NlLE1BQU1mLEVBQUUsRUFBRixDQURQO0NBQUEsS0FFQ2dCLE1BQU1oQixFQUFFLEVBQUYsQ0FGUDtDQUFBLEtBR0NpQixNQUFNakIsRUFBRSxFQUFGLENBSFA7O0NBS0EsS0FBSW9GLE1BQU1sRixNQUFNSyxHQUFOLEdBQVlKLE1BQU1HLEdBQTVCO0NBQ0EsS0FBSStFLE1BQU1uRixNQUFNTSxHQUFOLEdBQVlKLE1BQU1FLEdBQTVCO0NBQ0EsS0FBSWdGLE1BQU1wRixNQUFNTyxHQUFOLEdBQVlKLE1BQU1DLEdBQTVCO0NBQ0EsS0FBSWlGLE1BQU1wRixNQUFNSyxHQUFOLEdBQVlKLE1BQU1HLEdBQTVCO0NBQ0EsS0FBSWlGLE1BQU1yRixNQUFNTSxHQUFOLEdBQVlKLE1BQU1FLEdBQTVCO0NBQ0EsS0FBSWtGLE1BQU1yRixNQUFNSyxHQUFOLEdBQVlKLE1BQU1HLEdBQTVCO0NBQ0EsS0FBSWtGLE1BQU1oRixNQUFNSyxHQUFOLEdBQVlKLE1BQU1HLEdBQTVCO0NBQ0EsS0FBSTZFLE1BQU1qRixNQUFNTSxHQUFOLEdBQVlKLE1BQU1FLEdBQTVCO0NBQ0EsS0FBSThFLE1BQU1sRixNQUFNTyxHQUFOLEdBQVlKLE1BQU1DLEdBQTVCO0NBQ0EsS0FBSStFLE1BQU1sRixNQUFNSyxHQUFOLEdBQVlKLE1BQU1HLEdBQTVCO0NBQ0EsS0FBSStFLE1BQU1uRixNQUFNTSxHQUFOLEdBQVlKLE1BQU1FLEdBQTVCO0NBQ0EsS0FBSWdGLE1BQU1uRixNQUFNSyxHQUFOLEdBQVlKLE1BQU1HLEdBQTVCOztDQUVBO0NBQ0EsS0FBSWdGLE1BQU1aLE1BQU1XLEdBQU4sR0FBWVYsTUFBTVMsR0FBbEIsR0FBd0JSLE1BQU1PLEdBQTlCLEdBQW9DTixNQUFNSyxHQUExQyxHQUFnREosTUFBTUcsR0FBdEQsR0FBNERGLE1BQU1DLEdBQTVFOztDQUVBLEtBQUksQ0FBQ00sR0FBTCxFQUFVO0NBQ1QsU0FBTyxJQUFQO0NBQ0E7Q0FDREEsT0FBTSxNQUFNQSxHQUFaOztDQUVBbkcsS0FBSSxDQUFKLElBQVMsQ0FBQ1UsTUFBTXdGLEdBQU4sR0FBWXZGLE1BQU1zRixHQUFsQixHQUF3QnJGLE1BQU1vRixHQUEvQixJQUFzQ0csR0FBL0M7Q0FDQW5HLEtBQUksQ0FBSixJQUFTLENBQUNPLE1BQU0wRixHQUFOLEdBQVkzRixNQUFNNEYsR0FBbEIsR0FBd0IxRixNQUFNd0YsR0FBL0IsSUFBc0NHLEdBQS9DO0NBQ0FuRyxLQUFJLENBQUosSUFBUyxDQUFDa0IsTUFBTTBFLEdBQU4sR0FBWXpFLE1BQU13RSxHQUFsQixHQUF3QnZFLE1BQU1zRSxHQUEvQixJQUFzQ1MsR0FBL0M7Q0FDQW5HLEtBQUksQ0FBSixJQUFTLENBQUNlLE1BQU00RSxHQUFOLEdBQVk3RSxNQUFNOEUsR0FBbEIsR0FBd0I1RSxNQUFNMEUsR0FBL0IsSUFBc0NTLEdBQS9DO0NBQ0FuRyxLQUFJLENBQUosSUFBUyxDQUFDVyxNQUFNb0YsR0FBTixHQUFZdEYsTUFBTXlGLEdBQWxCLEdBQXdCdEYsTUFBTWtGLEdBQS9CLElBQXNDSyxHQUEvQztDQUNBbkcsS0FBSSxDQUFKLElBQVMsQ0FBQ0ssTUFBTTZGLEdBQU4sR0FBWTNGLE1BQU13RixHQUFsQixHQUF3QnZGLE1BQU1zRixHQUEvQixJQUFzQ0ssR0FBL0M7Q0FDQW5HLEtBQUksQ0FBSixJQUFTLENBQUNtQixNQUFNc0UsR0FBTixHQUFZeEUsTUFBTTJFLEdBQWxCLEdBQXdCeEUsTUFBTW9FLEdBQS9CLElBQXNDVyxHQUEvQztDQUNBbkcsS0FBSSxDQUFKLElBQVMsQ0FBQ2EsTUFBTStFLEdBQU4sR0FBWTdFLE1BQU0wRSxHQUFsQixHQUF3QnpFLE1BQU13RSxHQUEvQixJQUFzQ1csR0FBL0M7Q0FDQW5HLEtBQUksQ0FBSixJQUFTLENBQUNTLE1BQU13RixHQUFOLEdBQVl2RixNQUFNcUYsR0FBbEIsR0FBd0JuRixNQUFNaUYsR0FBL0IsSUFBc0NNLEdBQS9DO0NBQ0FuRyxLQUFJLENBQUosSUFBUyxDQUFDTSxNQUFNeUYsR0FBTixHQUFZMUYsTUFBTTRGLEdBQWxCLEdBQXdCekYsTUFBTXFGLEdBQS9CLElBQXNDTSxHQUEvQztDQUNBbkcsS0FBSSxFQUFKLElBQVUsQ0FBQ2lCLE1BQU0wRSxHQUFOLEdBQVl6RSxNQUFNdUUsR0FBbEIsR0FBd0JyRSxNQUFNbUUsR0FBL0IsSUFBc0NZLEdBQWhEO0NBQ0FuRyxLQUFJLEVBQUosSUFBVSxDQUFDYyxNQUFNMkUsR0FBTixHQUFZNUUsTUFBTThFLEdBQWxCLEdBQXdCM0UsTUFBTXVFLEdBQS9CLElBQXNDWSxHQUFoRDtDQUNBbkcsS0FBSSxFQUFKLElBQVUsQ0FBQ1UsTUFBTW9GLEdBQU4sR0FBWXJGLE1BQU11RixHQUFsQixHQUF3QnJGLE1BQU1rRixHQUEvQixJQUFzQ00sR0FBaEQ7Q0FDQW5HLEtBQUksRUFBSixJQUFVLENBQUNLLE1BQU0yRixHQUFOLEdBQVkxRixNQUFNd0YsR0FBbEIsR0FBd0J2RixNQUFNc0YsR0FBL0IsSUFBc0NNLEdBQWhEO0NBQ0FuRyxLQUFJLEVBQUosSUFBVSxDQUFDa0IsTUFBTXNFLEdBQU4sR0FBWXZFLE1BQU15RSxHQUFsQixHQUF3QnZFLE1BQU1vRSxHQUEvQixJQUFzQ1ksR0FBaEQ7Q0FDQW5HLEtBQUksRUFBSixJQUFVLENBQUNhLE1BQU02RSxHQUFOLEdBQVk1RSxNQUFNMEUsR0FBbEIsR0FBd0J6RSxNQUFNd0UsR0FBL0IsSUFBc0NZLEdBQWhEOztDQUVBLFFBQU9uRyxHQUFQO0NBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQ2xlTSxTQUFTRCxRQUFULEdBQWtCO0NBQ3hCLEtBQUlDLE1BQU0sSUFBSUMsVUFBSixDQUF3QixDQUF4QixDQUFWO0NBQ0EsS0FBSUEsVUFBQSxJQUF1Qk4sWUFBM0IsRUFBeUM7Q0FDeENLLE1BQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtDQUNBQSxNQUFJLENBQUosSUFBUyxDQUFUO0NBQ0E7Q0FDREEsS0FBSSxDQUFKLElBQVMsQ0FBVDtDQUNBLFFBQU9BLEdBQVA7Q0FDQTs7Ozs7O0NDVE0sU0FBU0QsUUFBVCxHQUFrQjtDQUN4QixLQUFJQyxNQUFNLElBQUlDLFVBQUosQ0FBd0IsQ0FBeEIsQ0FBVjtDQUNBLEtBQUlBLFVBQUEsSUFBdUJOLFlBQTNCLEVBQXlDO0NBQ3hDSyxNQUFJLENBQUosSUFBUyxDQUFUO0NBQ0FBLE1BQUksQ0FBSixJQUFTLENBQVQ7Q0FDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtDQUNBO0NBQ0QsUUFBT0EsR0FBUDtDQUNBOztBQUVELENBQU8sU0FBU29HLEdBQVQsQ0FBYXBHLEdBQWIsRUFBa0JHLENBQWxCLEVBQXFCQyxDQUFyQixFQUF3QjtDQUM5QkosS0FBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixJQUFPQyxFQUFFLENBQUYsQ0FBaEI7Q0FDQUosS0FBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixJQUFPQyxFQUFFLENBQUYsQ0FBaEI7Q0FDQUosS0FBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixJQUFPQyxFQUFFLENBQUYsQ0FBaEI7Q0FDQSxRQUFPSixHQUFQO0NBQ0E7O0FBRUQsQ0FBTyxTQUFTcUcsT0FBVCxDQUFpQnJHLEdBQWpCLEVBQXNCRyxDQUF0QixFQUF5QkMsQ0FBekIsRUFBNEJxQyxDQUE1QixFQUErQjtDQUNyQyxLQUFJNkQsSUFBSSxFQUFSO0NBQUEsS0FDQ0MsSUFBSSxFQURMO0NBRUE7Q0FDQUQsR0FBRSxDQUFGLElBQU9uRyxFQUFFLENBQUYsSUFBT0MsRUFBRSxDQUFGLENBQWQ7Q0FDQWtHLEdBQUUsQ0FBRixJQUFPbkcsRUFBRSxDQUFGLElBQU9DLEVBQUUsQ0FBRixDQUFkO0NBQ0FrRyxHQUFFLENBQUYsSUFBT25HLEVBQUUsQ0FBRixJQUFPQyxFQUFFLENBQUYsQ0FBZDtDQUNBO0NBQ0FtRyxHQUFFLENBQUYsSUFBT0QsRUFBRSxDQUFGLElBQU8vSCxLQUFLSyxHQUFMLENBQVM2RCxDQUFULENBQVAsR0FBcUI2RCxFQUFFLENBQUYsSUFBTy9ILEtBQUtHLEdBQUwsQ0FBUytELENBQVQsQ0FBbkM7Q0FDQThELEdBQUUsQ0FBRixJQUFPRCxFQUFFLENBQUYsSUFBTy9ILEtBQUtHLEdBQUwsQ0FBUytELENBQVQsQ0FBUCxHQUFxQjZELEVBQUUsQ0FBRixJQUFPL0gsS0FBS0ssR0FBTCxDQUFTNkQsQ0FBVCxDQUFuQztDQUNBOEQsR0FBRSxDQUFGLElBQU9ELEVBQUUsQ0FBRixDQUFQO0NBQ0E7Q0FDQXRHLEtBQUksQ0FBSixJQUFTdUcsRUFBRSxDQUFGLElBQU9uRyxFQUFFLENBQUYsQ0FBaEI7Q0FDQUosS0FBSSxDQUFKLElBQVN1RyxFQUFFLENBQUYsSUFBT25HLEVBQUUsQ0FBRixDQUFoQjtDQUNBSixLQUFJLENBQUosSUFBU3VHLEVBQUUsQ0FBRixJQUFPbkcsRUFBRSxDQUFGLENBQWhCO0NBQ0EsUUFBT0osR0FBUDtDQUNBOztBQUVELENBQU8sU0FBU3dHLE9BQVQsQ0FBaUJ4RyxHQUFqQixFQUFzQkcsQ0FBdEIsRUFBeUJDLENBQXpCLEVBQTRCcUMsQ0FBNUIsRUFBK0I7Q0FDckMsS0FBSTZELElBQUksRUFBUjtDQUFBLEtBQ0NDLElBQUksRUFETDtDQUVBO0NBQ0FELEdBQUUsQ0FBRixJQUFPbkcsRUFBRSxDQUFGLElBQU9DLEVBQUUsQ0FBRixDQUFkO0NBQ0FrRyxHQUFFLENBQUYsSUFBT25HLEVBQUUsQ0FBRixJQUFPQyxFQUFFLENBQUYsQ0FBZDtDQUNBa0csR0FBRSxDQUFGLElBQU9uRyxFQUFFLENBQUYsSUFBT0MsRUFBRSxDQUFGLENBQWQ7Q0FDQTtDQUNBbUcsR0FBRSxDQUFGLElBQU9ELEVBQUUsQ0FBRixJQUFPL0gsS0FBS0csR0FBTCxDQUFTK0QsQ0FBVCxDQUFQLEdBQXFCNkQsRUFBRSxDQUFGLElBQU8vSCxLQUFLSyxHQUFMLENBQVM2RCxDQUFULENBQW5DO0NBQ0E4RCxHQUFFLENBQUYsSUFBT0QsRUFBRSxDQUFGLENBQVA7Q0FDQUMsR0FBRSxDQUFGLElBQU9ELEVBQUUsQ0FBRixJQUFPL0gsS0FBS0ssR0FBTCxDQUFTNkQsQ0FBVCxDQUFQLEdBQXFCNkQsRUFBRSxDQUFGLElBQU8vSCxLQUFLRyxHQUFMLENBQVMrRCxDQUFULENBQW5DO0NBQ0E7Q0FDQXpDLEtBQUksQ0FBSixJQUFTdUcsRUFBRSxDQUFGLElBQU9uRyxFQUFFLENBQUYsQ0FBaEI7Q0FDQUosS0FBSSxDQUFKLElBQVN1RyxFQUFFLENBQUYsSUFBT25HLEVBQUUsQ0FBRixDQUFoQjtDQUNBSixLQUFJLENBQUosSUFBU3VHLEVBQUUsQ0FBRixJQUFPbkcsRUFBRSxDQUFGLENBQWhCO0NBQ0EsUUFBT0osR0FBUDtDQUNBOztBQUVELENBQU8sU0FBU3lHLGFBQVQsQ0FBdUJ6RyxHQUF2QixFQUE0QkcsQ0FBNUIsRUFBK0J1RyxDQUEvQixFQUFrQztDQUN4QyxLQUFJekgsSUFBSWtCLEVBQUUsQ0FBRixDQUFSO0NBQUEsS0FDQ2pCLElBQUlpQixFQUFFLENBQUYsQ0FETDtDQUFBLEtBRUNoQixJQUFJZ0IsRUFBRSxDQUFGLENBRkw7Q0FHQSxLQUFJa0UsSUFBSXFDLEVBQUUsQ0FBRixJQUFPekgsQ0FBUCxHQUFXeUgsRUFBRSxDQUFGLElBQU94SCxDQUFsQixHQUFzQndILEVBQUUsRUFBRixJQUFRdkgsQ0FBOUIsR0FBa0N1SCxFQUFFLEVBQUYsQ0FBMUM7Q0FDQXJDLEtBQUlBLEtBQUssR0FBVDtDQUNBckUsS0FBSSxDQUFKLElBQVMsQ0FBQzBHLEVBQUUsQ0FBRixJQUFPekgsQ0FBUCxHQUFXeUgsRUFBRSxDQUFGLElBQU94SCxDQUFsQixHQUFzQndILEVBQUUsQ0FBRixJQUFPdkgsQ0FBN0IsR0FBaUN1SCxFQUFFLEVBQUYsQ0FBbEMsSUFBMkNyQyxDQUFwRDtDQUNBckUsS0FBSSxDQUFKLElBQVMsQ0FBQzBHLEVBQUUsQ0FBRixJQUFPekgsQ0FBUCxHQUFXeUgsRUFBRSxDQUFGLElBQU94SCxDQUFsQixHQUFzQndILEVBQUUsQ0FBRixJQUFPdkgsQ0FBN0IsR0FBaUN1SCxFQUFFLEVBQUYsQ0FBbEMsSUFBMkNyQyxDQUFwRDtDQUNBckUsS0FBSSxDQUFKLElBQVMsQ0FBQzBHLEVBQUUsQ0FBRixJQUFPekgsQ0FBUCxHQUFXeUgsRUFBRSxDQUFGLElBQU94SCxDQUFsQixHQUFzQndILEVBQUUsRUFBRixJQUFRdkgsQ0FBOUIsR0FBa0N1SCxFQUFFLEVBQUYsQ0FBbkMsSUFBNENyQyxDQUFyRDtDQUNBLFFBQU9yRSxHQUFQO0NBQ0E7O0NBRUQ7Ozs7Ozs7O0FBUUEsQ0FBTyxTQUFTMkcsU0FBVCxDQUFtQjNHLEdBQW5CLEVBQXdCRyxDQUF4QixFQUEyQjtDQUNqQyxLQUFJbEIsSUFBSWtCLEVBQUUsQ0FBRixDQUFSO0NBQ0EsS0FBSWpCLElBQUlpQixFQUFFLENBQUYsQ0FBUjtDQUNBLEtBQUloQixJQUFJZ0IsRUFBRSxDQUFGLENBQVI7Q0FDQSxLQUFJb0QsTUFBTXRFLElBQUlBLENBQUosR0FBUUMsSUFBSUEsQ0FBWixHQUFnQkMsSUFBSUEsQ0FBOUI7Q0FDQSxLQUFJb0UsTUFBTSxDQUFWLEVBQWE7Q0FDWjtDQUNBQSxRQUFNLElBQUloRixLQUFLMkYsSUFBTCxDQUFVWCxHQUFWLENBQVY7Q0FDQXZELE1BQUksQ0FBSixJQUFTRyxFQUFFLENBQUYsSUFBT29ELEdBQWhCO0NBQ0F2RCxNQUFJLENBQUosSUFBU0csRUFBRSxDQUFGLElBQU9vRCxHQUFoQjtDQUNBdkQsTUFBSSxDQUFKLElBQVNHLEVBQUUsQ0FBRixJQUFPb0QsR0FBaEI7Q0FDQTtDQUNELFFBQU92RCxHQUFQO0NBQ0E7O0NBRUQ7Ozs7Ozs7OztBQVNBLENBQU8sU0FBUzRHLEtBQVQsQ0FBZTVHLEdBQWYsRUFBb0JHLENBQXBCLEVBQXVCQyxDQUF2QixFQUEwQjtDQUNoQyxLQUFJeUcsS0FBSzFHLEVBQUUsQ0FBRixDQUFUO0NBQUEsS0FDQzJHLEtBQUszRyxFQUFFLENBQUYsQ0FETjtDQUFBLEtBRUM0RyxLQUFLNUcsRUFBRSxDQUFGLENBRk47Q0FHQSxLQUFJNkcsS0FBSzVHLEVBQUUsQ0FBRixDQUFUO0NBQUEsS0FDQzZHLEtBQUs3RyxFQUFFLENBQUYsQ0FETjtDQUFBLEtBRUM4RyxLQUFLOUcsRUFBRSxDQUFGLENBRk47Q0FHQUosS0FBSSxDQUFKLElBQVM4RyxLQUFLSSxFQUFMLEdBQVVILEtBQUtFLEVBQXhCO0NBQ0FqSCxLQUFJLENBQUosSUFBUytHLEtBQUtDLEVBQUwsR0FBVUgsS0FBS0ssRUFBeEI7Q0FDQWxILEtBQUksQ0FBSixJQUFTNkcsS0FBS0ksRUFBTCxHQUFVSCxLQUFLRSxFQUF4QjtDQUNBLFFBQU9oSCxHQUFQO0NBQ0E7Ozs7Ozs7Ozs7OztDQzlHTSxTQUFTbUgsS0FBVCxDQUFlQyxLQUFmLEVBQXNCQyxHQUF0QixFQUEyQkMsR0FBM0IsRUFBZ0M7Q0FDdEMsUUFBTy9JLEtBQUs4SSxHQUFMLENBQVM5SSxLQUFLK0ksR0FBTCxDQUFTRixLQUFULEVBQWdCQyxHQUFoQixDQUFULEVBQStCQyxHQUEvQixDQUFQO0NBQ0E7O0FBRUQsQ0FBTyxTQUFTQyxLQUFULENBQWVGLEdBQWYsRUFBb0JDLEdBQXBCLEVBQXlCO0NBQy9CLFFBQU8sQ0FBQ0EsTUFBTUQsR0FBUCxJQUFjOUksS0FBS3VCLE1BQUwsRUFBZCxHQUE4QnVILEdBQXJDO0NBQ0E7O0NBRUQ7QUFDQSxDQUFPLFNBQVNHLHFCQUFULENBQStCQyxDQUEvQixFQUFrQ0MsQ0FBbEMsRUFBcUNDLENBQXJDLEVBQXdDO0NBQzlDLEtBQUlDLFdBQVdGLEVBQUV4SSxDQUFGLEdBQU11SSxFQUFFdkksQ0FBdkI7Q0FDQSxLQUFJMkksV0FBV0gsRUFBRXpJLENBQUYsR0FBTXdJLEVBQUV4SSxDQUF2QjtDQUNBLEtBQUk2SSxXQUFXSCxFQUFFekksQ0FBRixHQUFNd0ksRUFBRXhJLENBQXZCO0NBQ0EsS0FBSTZJLFdBQVdKLEVBQUUxSSxDQUFGLEdBQU15SSxFQUFFekksQ0FBdkI7O0NBRUEsS0FBSTJELFNBQVMsRUFBYjs7Q0FFQSxLQUFJb0YsU0FBU0osV0FBV0MsUUFBeEI7Q0FDQSxLQUFJSSxTQUFTSCxXQUFXQyxRQUF4Qjs7Q0FFQW5GLFFBQU8zRCxDQUFQLEdBQ0MsQ0FBQytJLFNBQVNDLE1BQVQsSUFBbUJSLEVBQUV2SSxDQUFGLEdBQU15SSxFQUFFekksQ0FBM0IsSUFBZ0MrSSxVQUFVUixFQUFFeEksQ0FBRixHQUFNeUksRUFBRXpJLENBQWxCLENBQWhDLEdBQXVEK0ksVUFBVU4sRUFBRXpJLENBQUYsR0FBTTBJLEVBQUUxSSxDQUFsQixDQUF4RCxLQUNDLEtBQUtnSixTQUFTRCxNQUFkLENBREQsQ0FERDtDQUdBcEYsUUFBTzFELENBQVAsR0FBWSxDQUFDLENBQUQsSUFBTTBELE9BQU8zRCxDQUFQLEdBQVcsQ0FBQ3dJLEVBQUV4SSxDQUFGLEdBQU15SSxFQUFFekksQ0FBVCxJQUFjLENBQS9CLENBQUQsR0FBc0MrSSxNQUF0QyxHQUErQyxDQUFDUCxFQUFFdkksQ0FBRixHQUFNd0ksRUFBRXhJLENBQVQsSUFBYyxDQUF4RTs7Q0FFQSxRQUFPMEQsTUFBUDtDQUNBOztDQUVEOzs7Ozs7O0FBT0EsQ0FBTyxTQUFTc0YsR0FBVCxDQUFhakosQ0FBYixFQUFnQkMsQ0FBaEIsRUFBbUJpQixDQUFuQixFQUFzQjtDQUM1QixRQUFPbEIsS0FBSyxJQUFJa0IsQ0FBVCxJQUFjakIsSUFBSWlCLENBQXpCO0NBQ0E7O0FBRUQsQ0FBTyxTQUFTZ0ksUUFBVCxDQUFrQmYsS0FBbEIsRUFBeUI7Q0FDL0I7Q0FDQSxRQUFPQSxRQUFRLG9CQUFmO0NBQ0E7O0FBRUQsQ0FBTyxTQUFTZ0IsUUFBVCxDQUFrQmhCLEtBQWxCLEVBQXlCO0NBQy9CO0NBQ0EsUUFBTyxvQkFBb0JBLEtBQTNCO0NBQ0E7Ozs7Ozs7Ozs7O0NDL0NEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQ0VhaUIsTUFBYjtDQUNDLGlCQUFZQyxLQUFaLEVBQW1CQyxNQUFuQixFQUE2RDtDQUFBLE1BQWxDQyxHQUFrQyx1RUFBNUIsRUFBNEI7Q0FBQSxNQUF4QjVHLElBQXdCLHVFQUFqQixHQUFpQjtDQUFBLE1BQVpDLEdBQVksdUVBQU4sSUFBTTtDQUFBOztDQUM1RCxPQUFLNEcsUUFBTCxHQUFnQixFQUFFeEosR0FBRyxDQUFMLEVBQVFDLEdBQUcsQ0FBWCxFQUFjQyxHQUFHLENBQWpCLEVBQWhCO0NBQ0EsT0FBS3VKLGNBQUwsR0FBc0IsRUFBRXpKLEdBQUcsQ0FBTCxFQUFRQyxHQUFHLENBQVgsRUFBY0MsR0FBRyxDQUFqQixFQUF0Qjs7Q0FFQSxPQUFLd0osV0FBTCxHQUFtQkMsTUFBQSxFQUFuQjtDQUNBLE9BQUtDLGlCQUFMLEdBQXlCRCxNQUFBLEVBQXpCOztDQUVBLE9BQUtFLGlCQUFMLENBQXVCUixLQUF2QixFQUE4QkMsTUFBOUIsRUFBc0NDLEdBQXRDLEVBQTJDNUcsSUFBM0MsRUFBaURDLEdBQWpEO0NBQ0E7O0NBVEY7Q0FBQTtDQUFBLG9DQVdtQnlHLEtBWG5CLEVBVzBCQyxNQVgxQixFQVdrQ0MsR0FYbEMsRUFXdUM1RyxJQVh2QyxFQVc2Q0MsR0FYN0MsRUFXa0Q7Q0FDaEQrRyxjQUFBLENBQWlCLEtBQUtDLGlCQUF0QixFQUEwQ0wsTUFBTSxHQUFQLEdBQWNqSyxLQUFLQyxFQUE1RCxFQUFnRThKLFFBQVFDLE1BQXhFLEVBQWdGM0csSUFBaEYsRUFBc0ZDLEdBQXRGO0NBQ0E7Q0FiRjtDQUFBO0NBQUEsbUNBZXdDO0NBQUEsT0FBeEJ5QyxFQUF3Qix1RUFBbkIsQ0FBbUI7Q0FBQSxPQUFoQkcsRUFBZ0IsdUVBQVgsQ0FBVztDQUFBLE9BQVJFLEVBQVEsdUVBQUgsQ0FBRzs7Q0FDdEMsUUFBSzhELFFBQUwsQ0FBY3hKLENBQWQsR0FBa0JxRixFQUFsQjtDQUNBLFFBQUttRSxRQUFMLENBQWN2SixDQUFkLEdBQWtCdUYsRUFBbEI7Q0FDQSxRQUFLZ0UsUUFBTCxDQUFjdEosQ0FBZCxHQUFrQndGLEVBQWxCO0NBQ0E7Q0FuQkY7Q0FBQTtDQUFBLHlDQXFCaUQ7Q0FBQSxPQUEzQkwsRUFBMkIsdUVBQXRCLENBQXNCO0NBQUEsT0FBbkJHLEVBQW1CLHVFQUFkLENBQWM7Q0FBQSxPQUFYRSxFQUFXLHVFQUFOLENBQUMsR0FBSzs7Q0FDL0MsUUFBSytELGNBQUwsQ0FBb0J6SixDQUFwQixHQUF3QnFGLEVBQXhCO0NBQ0EsUUFBS29FLGNBQUwsQ0FBb0J4SixDQUFwQixHQUF3QnVGLEVBQXhCO0NBQ0EsUUFBS2lFLGNBQUwsQ0FBb0J2SixDQUFwQixHQUF3QndGLEVBQXhCO0NBQ0E7Q0F6QkY7Q0FBQTtDQUFBLHFDQTJCb0I7Q0FDbEJpRSxTQUFBLENBQ0MsS0FBS0QsV0FETixFQUVDLENBQUMsS0FBS0YsUUFBTCxDQUFjeEosQ0FBZixFQUFrQixLQUFLd0osUUFBTCxDQUFjdkosQ0FBaEMsRUFBbUMsS0FBS3VKLFFBQUwsQ0FBY3RKLENBQWpELENBRkQsRUFHQyxDQUFDLEtBQUt1SixjQUFMLENBQW9CekosQ0FBckIsRUFBd0IsS0FBS3lKLGNBQUwsQ0FBb0J4SixDQUE1QyxFQUErQyxLQUFLd0osY0FBTCxDQUFvQnZKLENBQW5FLENBSEQsRUFJQyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUpEO0NBTUE7Q0FDQTtDQUNBO0NBcENGO0NBQUE7Q0FBQSx5QkFzQ2tCO0NBQ2hCLFVBQU8sS0FBS3dKLFdBQVo7Q0FDQTtDQXhDRjtDQUFBO0NBQUEseUJBMEN3QjtDQUN0QixVQUFPLEtBQUtFLGlCQUFaO0NBQ0E7Q0E1Q0Y7Q0FBQTtDQUFBOztDQ0ZBdE4sUUFBUXdOLEdBQVIsQ0FBWSw0Q0FBWixFQUEwRCx3Q0FBMUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
