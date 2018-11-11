(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.dsr = {})));
}(this, (function (exports) { 'use strict';

	/**
	 * get uniform locations
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLProgram} program
	 * @param {Array} arr
	 *
	 * @returns {object} uniformLocation
	 */

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
	function compileGLShader(gl, type, shaderSource) {
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
	function createPrgoram(gl, vertexShaderSrc, fragmentShaderSrc) {
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

	function getSphere(radius = 2, latitudeBands = 64, longitudeBands = 64) {
		var vertices = [];
		var textures = [];
		var normals = [];
		var indices = [];

		for (var latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
			var theta = (latNumber * Math.PI) / latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);

			for (var longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
				var phi = (longNumber * 2 * Math.PI) / longitudeBands;
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

	const EPSILON = 0.000001;
	let ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
	const RANDOM = Math.random;

	var common = /*#__PURE__*/Object.freeze({
		EPSILON: EPSILON,
		ARRAY_TYPE: ARRAY_TYPE,
		RANDOM: RANDOM
	});

	function create() {
		let out = new ARRAY_TYPE(16);
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
		let a00 = a[0],
			a01 = a[1],
			a02 = a[2],
			a03 = a[3];
		let a10 = a[4],
			a11 = a[5],
			a12 = a[6],
			a13 = a[7];
		let a20 = a[8],
			a21 = a[9],
			a22 = a[10],
			a23 = a[11];
		let a30 = a[12],
			a31 = a[13],
			a32 = a[14],
			a33 = a[15];
		// Cache only the current line of the second matrix
		let b0 = b[0],
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
		let f = 1.0 / Math.tan(fovy / 2),
			nf;
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
		let out = new ARRAY_TYPE(16);
		for (let ii = 0; ii < out.length; ii++) {
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
		let s = Math.sin(rad);
		let c = Math.cos(rad);
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
		let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
		let eyex = eye[0];
		let eyey = eye[1];
		let eyez = eye[2];
		let upx = up[0];
		let upy = up[1];
		let upz = up[2];
		let centerx = center[0];
		let centery = center[1];
		let centerz = center[2];

		if (
			Math.abs(eyex - centerx) < EPSILON &&
			Math.abs(eyey - centery) < EPSILON &&
			Math.abs(eyez - centerz) < EPSILON
		) {
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
		let x = q[0],
			y = q[1],
			z = q[2],
			w = q[3];
		let x2 = x + x;
		let y2 = y + y;
		let z2 = z + z;
		let xx = x * x2;
		let xy = x * y2;
		let xz = x * z2;
		let yy = y * y2;
		let yz = y * z2;
		let zz = z * z2;
		let wx = w * x2;
		let wy = w * y2;
		let wz = w * z2;
		let sx = s[0];
		let sy = s[1];
		let sz = s[2];
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
		let s = Math.sin(rad);
		let c = Math.cos(rad);
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
		let eyex = eye[0],
			eyey = eye[1],
			eyez = eye[2],
			upx = up[0],
			upy = up[1],
			upz = up[2];
		let z0 = eyex - target[0],
			z1 = eyey - target[1],
			z2 = eyez - target[2];
		let len = z0 * z0 + z1 * z1 + z2 * z2;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			z0 *= len;
			z1 *= len;
			z2 *= len;
		}
		let x0 = upy * z2 - upz * z1,
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
		targetTo: targetTo
	});

	function create$1() {
		let out = new ARRAY_TYPE(4);
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
		let out = new ARRAY_TYPE(3);
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
		let p = [],
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
		let p = [],
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
		let x = a[0],
			y = a[1],
			z = a[2];
		let w = m[3] * x + m[7] * y + m[11] * z + m[15];
		w = w || 1.0;
		out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
		out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
		out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
		return out;
	}

	var vec3 = /*#__PURE__*/Object.freeze({
		create: create$2,
		add: add,
		rotateZ: rotateZ,
		rotateY: rotateY,
		transformMat4: transformMat4
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

		let center = {};

		var aSlope = yDelta_a / xDelta_a;
		var bSlope = yDelta_b / xDelta_b;

		center.x =
			(aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) /
			(2 * (bSlope - aSlope));
		center.y = (-1 * (center.x - (A.x + B.x) / 2)) / aSlope + (A.y + B.y) / 2;

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

	exports.compileGLShader = compileGLShader;
	exports.createPrgoram = createPrgoram;
	exports.getSphere = getSphere;
	exports.glMatrix = common;
	exports.mat4 = mat4;
	exports.quat = quat;
	exports.vec3 = vec3;
	exports.math = math;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
