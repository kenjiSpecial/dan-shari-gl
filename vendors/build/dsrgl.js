(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.dsr = {})));
}(this, (function (exports) { 'use strict';

	var FLOAT = 0x1406;

	var RGB = 0x1907;
	var CLAMP_TO_EDGE = 0x812f;

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
			console.error("[WebGLShader]: Shader couldn't compile.1");

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
	function createBuffer(gl, program, data, str) {
		var buffer = gl.createBuffer();
		var location = gl.getAttribLocation(program, str);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		return { buffer: buffer, location: location };
	}

	/**
	 * create indexbuffer
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

	/**
	 *
	 * create empty texture
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {*} targetTextureWidth
	 * @param {*} targetTextureHeight
	 */
	function createEmptyTexture(gl, textureWidth, textureHeight) {
		var format = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : RGB;
		var minFilter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : LINEAR;
		var magFilter = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : LINEAR;
		var wrapS = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : CLAMP_TO_EDGE;
		var wrapT = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : CLAMP_TO_EDGE;

		var targetTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, targetTexture);

		// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, textureWidth, textureWidth, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

		console.log(format);
		if (gl.DEPTH_COMPONENT === format) console.log('format is DEPTH_COMPONENT');

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
	function createImageTexture(gl, image) {
		var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : RGB;
		var isFlip = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
		var isMipmap = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

		var texture = gl.createTexture();
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
	function updateImageTexture(gl, texture, image) {
		var format = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : RGB;

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
		return (value & value - 1) == 0;
	}

	/**
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLTexture} texture
	 * @param {WebGLUniformLocation} uniformLocation
	 * @param {number} textureNum
	 */
	function activeTexture(gl, texture, uniformLocation) {
		var textureNum = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

		var activeTextureNum = gl.TEXTURE0 + textureNum;
		gl.activeTexture(activeTextureNum);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(uniformLocation, textureNum);
	}

	/**
	 * load json file
	 * @param {String} url
	 */

	function getAjaxJson(url) {
		var promise = new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			//    xhr.responseType = 'json';

			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						// console.log('xhr done successfully');

						var resp = xhr.responseText;
						var respJson = JSON.parse(resp);
						resolve(respJson);
					} else {
						reject(xhr.status);
						// console.log('xhr failed');
					}
				}
			};

			xhr.send();
		});

		return promise;
	}

	/**
	 * load asset image
	 *
	 * @param {*} imageUrl
	 */
	function getImage(imageUrl) {
		var promise = new Promise(function (resolve, reject) {
			var image = new Image();
			image.onload = function () {
				resolve(image);
			};
			image.onerror = function () {
				reject('image is not loaded');
			};

			image.src = imageUrl;
		});

		return promise;
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
			uvs: textures,
			normals: normals,
			indices: indices
		};
	}

	function getPlane(width, height, widthSegment, heightSegment) {
		var vertices = [];
		var xRate = 1 / widthSegment;
		var yRate = 1 / heightSegment;

		// set vertices and barycentric vertices
		for (var yy = 0; yy <= heightSegment; yy++) {
			var yPos = (-0.5 + yRate * yy) * height;

			for (var xx = 0; xx <= widthSegment; xx++) {
				var xPos = (-0.5 + xRate * xx) * width;
				vertices.push(xPos);
				vertices.push(yPos);
			}
		}

		var indices = [];

		for (var _yy = 0; _yy < heightSegment; _yy++) {
			for (var _xx = 0; _xx < widthSegment; _xx++) {
				var rowStartNum = _yy * (widthSegment + 1);
				var nextRowStartNum = (_yy + 1) * (widthSegment + 1);

				indices.push(rowStartNum + _xx);
				indices.push(rowStartNum + _xx + 1);
				indices.push(nextRowStartNum + _xx);

				indices.push(rowStartNum + _xx + 1);
				indices.push(nextRowStartNum + _xx + 1);
				indices.push(nextRowStartNum + _xx);
			}
		}

		return {
			vertices: vertices,
			indices: indices
		};
	}

	/**
	 * merge geometries into one geometry
	 *
	 * @param {array} geometries
	 */
	function mergeGeomtory(geometries) {
		var vertices = [],
		    normals = [],
		    uvs = [],
		    indices = [];

		var lastVertices = 0;

		for (var ii = 0; ii < geometries.length; ii++) {
			var geometry = geometries[ii];

			if (geometries.indices.length > 0) {
				for (var _ii = 0; geometries.indices.length; _ii++) {
					indices.push(geometry.indices[_ii] + lastVertices / 3);
				}
			}

			if (geometry.vertices.length > 0) {
				for (var _ii2 = 0; _ii2 < geometry.vertices.length; _ii2++) {
					vertices.push(geometry.vertices[_ii2]);
				}

				lastVertices += geometry.vertices.length;
			}

			if (geometry.normals.length > 0) {
				for (var _ii3 = 0; _ii3 < geometry.normals.length; _ii3++) {
					normals.push(geometry.normals[_ii3]);
				}
			}

			if (geometry.uvs.length > 0) {
				for (var _ii4 = 0; _ii4 < geometry.uvs.length; _ii4++) {
					uvs.push(geometry.uvs[_ii4]);
				}
			}
		}

		return {
			vertices: vertices,
			normals: normals,
			uvs: uvs,
			indices: indices
		};
	}

	// segment is one
	function createSimpleBox(width, height, depth) {
		var x = -width / 2;
		var y = -height / 2;
		var z = -depth / 2;

		var fbl = {
			x: x,
			y: y,
			z: z + depth
		};
		var fbr = {
			x: x + width,
			y: y,
			z: z + depth
		};
		var ftl = {
			x: x,
			y: y + height,
			z: z + depth
		};
		var ftr = {
			x: x + width,
			y: y + height,
			z: z + depth
		};
		var bbl = {
			x: x,
			y: y,
			z: z
		};
		var bbr = {
			x: x + width,
			y: y,
			z: z
		};
		var btl = {
			x: x,
			y: y + height,
			z: z
		};
		var btr = {
			x: x + width,
			y: y + height,
			z: z
		};

		var positions = new Float32Array([
		//front
		fbl.x, fbl.y, fbl.z, fbr.x, fbr.y, fbr.z, ftl.x, ftl.y, ftl.z, ftl.x, ftl.y, ftl.z, fbr.x, fbr.y, fbr.z, ftr.x, ftr.y, ftr.z,

		//right
		fbr.x, fbr.y, fbr.z, bbr.x, bbr.y, bbr.z, ftr.x, ftr.y, ftr.z, ftr.x, ftr.y, ftr.z, bbr.x, bbr.y, bbr.z, btr.x, btr.y, btr.z,

		//back
		fbr.x, bbr.y, bbr.z, bbl.x, bbl.y, bbl.z, btr.x, btr.y, btr.z, btr.x, btr.y, btr.z, bbl.x, bbl.y, bbl.z, btl.x, btl.y, btl.z,

		//left
		bbl.x, bbl.y, bbl.z, fbl.x, fbl.y, fbl.z, btl.x, btl.y, btl.z, btl.x, btl.y, btl.z, fbl.x, fbl.y, fbl.z, ftl.x, ftl.y, ftl.z,

		//top
		ftl.x, ftl.y, ftl.z, ftr.x, ftr.y, ftr.z, btl.x, btl.y, btl.z, btl.x, btl.y, btl.z, ftr.x, ftr.y, ftr.z, btr.x, btr.y, btr.z,

		//bottom
		bbl.x, bbl.y, bbl.z, bbr.x, bbr.y, bbr.z, fbl.x, fbl.y, fbl.z, fbl.x, fbl.y, fbl.z, bbr.x, bbr.y, bbr.z, fbr.x, fbr.y, fbr.z]);

		var layoutPosition = new Float32Array([
		// front
		1, 2,
		//
		2, 2,
		//
		1, 1,
		//
		//
		1, 1,
		//
		2, 2,
		//
		2, 1,
		//
		// right
		//
		1 + 1, 2,
		//
		2 + 1, 2,
		//
		1 + 1, 1,
		//
		//
		1 + 1, 1,
		//
		2 + 1, 2,
		//
		2 + 1, 1,
		//
		// back
		//
		1 + 2, 2,
		//
		2 + 2, 2,
		//
		1 + 2, 1,
		//
		//
		1 + 2, 1,
		//
		2 + 2, 2,
		//
		2 + 2, 1,
		//
		//
		// back
		//
		1 - 1, 2,
		//
		2 - 1, 2,
		//
		1 - 1, 1,
		//
		//
		1 - 1, 1,
		//
		2 - 1, 2,
		//
		2 - 1, 1,
		//
		// top
		//
		1, 2 - 1,
		//
		2, 2 - 1,
		//
		1, 1 - 1,
		//
		//
		1, 1 - 1,
		//
		2, 2 - 1,
		//
		2, 1 - 1,
		//
		// bottom
		//
		1, 2 + 1,
		//
		2, 2 + 1,
		//
		1, 1 + 1,
		//
		//
		1, 1 + 1,
		//
		2, 2 + 1,
		//
		2, 1 + 1
		//
		]);

		var uvs = new Float32Array([
		//front
		0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

		//right
		0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

		//back
		0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

		//left
		0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

		//top
		0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

		//bottom
		0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

		var normals = new Float32Array(positions.length);
		var i = void 0,
		    count = void 0;
		var ni = void 0;

		for (i = 0, count = positions.length / 3; i < count; i++) {
			ni = i * 3;

			normals[ni] = parseInt(i / 6, 10) === 1 ? 1 : parseInt(i / 6, 10) === 3 ? -1 : 0;

			normals[ni + 1] = parseInt(i / 6, 10) === 4 ? 1 : parseInt(i / 6, 10) === 5 ? -1 : 0;

			normals[ni + 2] = parseInt(i / 6, 10) === 0 ? 1 : parseInt(i / 6, 10) === 2 ? -1 : 0;
		}

		return {
			vertices: positions,
			normals: normals,
			uvs: uvs,
			layoutPosition: layoutPosition
		};
	}

	function createSimplePlane(width, height) {
		var x = -width / 2;
		var y = -height / 2;

		var bl = {
			x: x,
			y: y,
			z: 0
		};
		var br = {
			x: x + width,
			y: y,
			z: 0
		};
		var tl = {
			x: x,
			y: y + height,
			z: 0
		};
		var tr = {
			x: x + width,
			y: y + height,
			z: 0
		};

		var positions = new Float32Array([bl.x, bl.y, bl.z, br.x, br.y, br.z, tl.x, tl.y, tl.z, tl.x, tl.y, tl.z, br.x, br.y, br.z, tr.x, tr.y, tr.z]);

		var uvs = new Float32Array([
		//front
		0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

		var normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
		// let indices = [0, 1, 3];

		return {
			vertices: positions,
			normals: normals,
			uvs: uvs
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

	/**
	 * Generates a perspective projection matrix with the given bounds.
	 * Passing null/undefined/no value for far will generate infinite projection matrix.
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} fovy Vertical field of view in radians
	 * @param {number} aspect Aspect ratio. typically viewport width/height
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum, can be null or Infinity
	 * @returns {mat4} out
	 *
	 */
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

	/**
	 * Generates a orthogonal projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} left Left bound of the frustum
	 * @param {number} right Right bound of the frustum
	 * @param {number} bottom Bottom bound of the frustum
	 * @param {number} top Top bound of the frustum
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	function ortho(out, left, right, bottom, top, near, far) {
		var lr = 1 / (left - right);
		var bt = 1 / (bottom - top);
		var nf = 1 / (near - far);
		out[0] = -2 * lr;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = -2 * bt;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = 2 * nf;
		out[11] = 0;
		out[12] = (left + right) * lr;
		out[13] = (top + bottom) * bt;
		out[14] = (far + near) * nf;
		out[15] = 1;
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
		ortho: ortho,
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

	/**
	 * Rotates a quaternion by the given angle about the X axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	function rotateX(out, a, rad) {
		rad *= 0.5;
		var ax = a[0],
		    ay = a[1],
		    az = a[2],
		    aw = a[3];
		var bx = Math.sin(rad),
		    bw = Math.cos(rad);
		out[0] = ax * bw + aw * bx;
		out[1] = ay * bw + az * bx;
		out[2] = az * bw - ay * bx;
		out[3] = aw * bw - ax * bx;
		return out;
	}

	var quat = /*#__PURE__*/Object.freeze({
		create: create$1,
		rotateX: rotateX
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

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	var Camera = function () {
		function Camera() {
			var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'camera';
			classCallCheck(this, Camera);

			this.type = type;
			this.position = { x: 0, y: 0, z: 0 };
			this.lookAtPosition = { x: 0, y: 0, z: 0 };

			this.viewMatrix = create();
			this.projectionMatrix = create();
		}

		createClass(Camera, [{
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
				lookAt(this.viewMatrix, [this.position.x, this.position.y, this.position.z], [this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z], [0, 1, 0]);
			}
		}]);
		return Camera;
	}();

	var PerspectiveCamera = function (_Camera) {
		inherits(PerspectiveCamera, _Camera);

		function PerspectiveCamera(width, height) {
			var fov = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 45;
			var near = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
			var far = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1000;
			classCallCheck(this, PerspectiveCamera);

			var _this = possibleConstructorReturn(this, (PerspectiveCamera.__proto__ || Object.getPrototypeOf(PerspectiveCamera)).call(this, 'perspective'));

			_this.updatePerspective(width, height, fov, near, far);
			return _this;
		}

		createClass(PerspectiveCamera, [{
			key: 'updatePerspective',
			value: function updatePerspective(width, height, fov, near, far) {
				perspective(this.projectionMatrix, fov / 180 * Math.PI, width / height, near, far);
			}
		}]);
		return PerspectiveCamera;
	}(Camera);

	var OrthoCamera = function (_Camera2) {
		inherits(OrthoCamera, _Camera2);

		function OrthoCamera(left, right, bottom, top, near, far) {
			classCallCheck(this, OrthoCamera);

			var _this2 = possibleConstructorReturn(this, (OrthoCamera.__proto__ || Object.getPrototypeOf(OrthoCamera)).call(this, 'ortho'));

			_this2.updatePerspective(left, right, bottom, top, near, far);
			return _this2;
		}

		createClass(OrthoCamera, [{
			key: 'updatePerspective',
			value: function updatePerspective(left, right, bottom, top, near, far) {
				ortho(this.projectionMatrix, left, right, bottom, top, near, far);
			}
		}]);
		return OrthoCamera;
	}(Camera);

	console.log('[danshariGL] version: DANSHARI_VERSOIN, %o', 'https://github.com/kenjiSpecial/tubugl');

	exports.getUniformLocations = getUniformLocations;
	exports.addLineNumbers = addLineNumbers;
	exports.compileGLShader = compileGLShader;
	exports.createPrgoram = createPrgoram;
	exports.createBuffer = createBuffer;
	exports.createIndex = createIndex;
	exports.bindBuffer = bindBuffer;
	exports.createEmptyTexture = createEmptyTexture;
	exports.createImageTexture = createImageTexture;
	exports.updateImageTexture = updateImageTexture;
	exports.activeTexture = activeTexture;
	exports.getAjaxJson = getAjaxJson;
	exports.getImage = getImage;
	exports.getSphere = getSphere;
	exports.getPlane = getPlane;
	exports.mergeGeomtory = mergeGeomtory;
	exports.createSimpleBox = createSimpleBox;
	exports.createSimplePlane = createSimplePlane;
	exports.Camera = Camera;
	exports.PerspectiveCamera = PerspectiveCamera;
	exports.OrthoCamera = OrthoCamera;
	exports.glMatrix = common;
	exports.mat4 = mat4;
	exports.quat = quat;
	exports.vec3 = vec3;
	exports.math = math;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHNyZ2wuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9jb25zdHMuanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvZnVuY3Rpb25zL2dsLWZ1bmN0aW9ucy5qcyIsIi4uLy4uLy4uL3NyYy91dGlscy9mdW5jdGlvbnMvZ2wtdGV4dHVyZXMuanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvZnVuY3Rpb25zL2Fzc2V0cy1mdW5jdGlvbnMuanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvZ2VuZXJhdGUvZ2VuZXJhdGUtZ2VvbWV0cnkuanMiLCIuLi8uLi8uLi9zcmMvdXRpbHMvZ2VuZXJhdGUvZ2VuZXJhdGUtc2ltcGxlLWdlb21ldHJ5LmpzIiwiLi4vLi4vLi4vc3JjL21hdGgvZ2wtbWF0cml4L2NvbW1vbi5qcyIsIi4uLy4uLy4uL3NyYy9tYXRoL2dsLW1hdHJpeC9tYXQ0LmpzIiwiLi4vLi4vLi4vc3JjL21hdGgvZ2wtbWF0cml4L3F1YXQuanMiLCIuLi8uLi8uLi9zcmMvbWF0aC9nbC1tYXRyaXgvdmVjMy5qcyIsIi4uLy4uLy4uL3NyYy9tYXRoL21hdGguanMiLCIuLi8uLi8uLi9zcmMvbWF0aC9pbmRleC5qcyIsIi4uLy4uLy4uL3NyYy9jYW1lcmEvaW5kZXguanMiLCIuLi8uLi8uLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IEZMT0FUID0gMHgxNDA2O1xyXG5cclxuZXhwb3J0IGNvbnN0IFJHQiA9IDB4MTkwNztcclxuXHJcbi8vIHZhcmlhYmxlcyByZWxhdGluZyB0byB0ZXh0dXJlc1xyXG5leHBvcnQgY29uc3QgTkVBUkVTVCA9IDB4MjYwMDtcclxuZXhwb3J0IGNvbnN0IExJTkVBUiA9IDB4MjYwMTtcclxuZXhwb3J0IGNvbnN0IE5FQVJFU1RfTUlQTUFQX05FQVJFU1QgPSAweDI3MDA7XHJcbmV4cG9ydCBjb25zdCBMSU5FQVJfTUlQTUFQX05FQVJFU1QgPSAweDI3MDE7XHJcbmV4cG9ydCBjb25zdCBORUFSRVNUX01JUE1BUF9MSU5FQVIgPSAweDI3MDI7XHJcbmV4cG9ydCBjb25zdCBMSU5FQVJfTUlQTUFQX0xJTkVBUiA9IDB4MjcwMztcclxuZXhwb3J0IGNvbnN0IENMQU1QX1RPX0VER0UgPSAweDgxMmY7XHJcbmV4cG9ydCBjb25zdCBSRVBFQVQgPSAweDI5MDE7XHJcblxyXG4vLyBGcmFtZWJ1ZmZlcnMgYW5kIHJlbmRlcmJ1ZmZlcnNcclxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYkdMX0FQSS9Db25zdGFudHMjRnJhbWVidWZmZXJzX2FuZF9yZW5kZXJidWZmZXJzXHJcblxyXG5leHBvcnQgY29uc3QgREVQVEhfQ09NUE9ORU5UMTYgPSAweDgxYTU7XHJcblxyXG4vLyBEYXRhIHR5cGVzXHJcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJHTF9BUEkvQ29uc3RhbnRzI0RhdGFfdHlwZXNcclxuXHJcbmV4cG9ydCBjb25zdCBVTlNJR05FRF9CWVRFID0gMHgxNDAxO1xyXG4iLCJpbXBvcnQgeyBGTE9BVCB9IGZyb20gJy4uL2NvbnN0cyc7XHJcblxyXG4vKipcclxuICogZ2V0IHVuaWZvcm0gbG9jYXRpb25zXHJcbiAqXHJcbiAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gKiBAcGFyYW0ge1dlYkdMUHJvZ3JhbX0gcHJvZ3JhbVxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcclxuICpcclxuICogQHJldHVybnMge29iamVjdH0gdW5pZm9ybUxvY2F0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5pZm9ybUxvY2F0aW9ucyhnbCwgcHJvZ3JhbSwgYXJyKSB7XHJcblx0bGV0IGxvY2F0aW9ucyA9IHt9O1xyXG5cclxuXHRmb3IgKGxldCBpaSA9IDA7IGlpIDwgYXJyLmxlbmd0aDsgaWkrKykge1xyXG5cdFx0bGV0IG5hbWUgPSBhcnJbaWldO1xyXG5cdFx0bGV0IHVuaWZvcm1Mb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBuYW1lKTtcclxuXHRcdGxvY2F0aW9uc1tuYW1lXSA9IHVuaWZvcm1Mb2NhdGlvbjtcclxuXHR9XHJcblxyXG5cdHJldHVybiBsb2NhdGlvbnM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBjb21waWxlIHNoYWRlciBiYXNlZCBvbiB0aHJlZS5qc1xyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRMaW5lTnVtYmVycyhzdHJpbmcpIHtcclxuXHRsZXQgbGluZXMgPSBzdHJpbmcuc3BsaXQoJ1xcbicpO1xyXG5cclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRsaW5lc1tpXSA9IGkgKyAxICsgJzogJyArIGxpbmVzW2ldO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xyXG59XHJcblxyXG4vKipcclxuICogY29tcGlsZSB3ZWJnbCBzaGFkZXJcclxuICpcclxuICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsXHJcbiAqIEBwYXJhbSB7Kn0gdHlwZVxyXG4gKiBAcGFyYW0geyp9IHNoYWRlclNvdXJjZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVHTFNoYWRlcihnbCwgdHlwZSwgc2hhZGVyU291cmNlKSB7XHJcblx0bGV0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcclxuXHJcblx0Z2wuc2hhZGVyU291cmNlKHNoYWRlciwgc2hhZGVyU291cmNlKTtcclxuXHRnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XHJcblxyXG5cdGlmIChnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuXHRcdHJldHVybiBzaGFkZXI7XHJcblx0fSBlbHNlIHtcclxuXHRcdGNvbnNvbGUuZXJyb3IoXCJbV2ViR0xTaGFkZXJdOiBTaGFkZXIgY291bGRuJ3QgY29tcGlsZS4xXCIpO1xyXG5cclxuXHRcdGlmIChnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikgIT09ICcnKSB7XHJcblx0XHRcdGNvbnNvbGUud2FybihcclxuXHRcdFx0XHQnW1dlYkdMU2hhZGVyXTogZ2wuZ2V0U2hhZGVySW5mb0xvZygpJyxcclxuXHRcdFx0XHR0eXBlID09PSBnbC5WRVJURVhfU0hBREVSID8gJ3ZlcnRleCcgOiAnZnJhZ21lbnQnLFxyXG5cdFx0XHRcdGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKSxcclxuXHRcdFx0XHRhZGRMaW5lTnVtYmVycyhzaGFkZXJTb3VyY2UpXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBjcmVhdGUgcHJvZ3JhbVxyXG4gKlxyXG4gKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICogQHBhcmFtIHtTdHJpbmd9IHZlcnR4U2hhZGVyU3JjXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmcmFnbWVudFNoYWRlclNyY1xyXG4gKlxyXG4gKiBAcmV0dXJucyB7V2ViR0xQcm9ncmFtfSBwcm9ncmFtXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJnb3JhbShnbCwgdmVydGV4U2hhZGVyU3JjLCBmcmFnbWVudFNoYWRlclNyYykge1xyXG5cdGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblxyXG5cdGNvbnN0IHZlcnRleFNoYWRlciA9IGNvbXBpbGVHTFNoYWRlcihnbCwgZ2wuVkVSVEVYX1NIQURFUiwgdmVydGV4U2hhZGVyU3JjKTtcclxuXHRjb25zdCBmcmFnbWVudFNoYWRlciA9IGNvbXBpbGVHTFNoYWRlcihnbCwgZ2wuRlJBR01FTlRfU0hBREVSLCBmcmFnbWVudFNoYWRlclNyYyk7XHJcblxyXG5cdGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xyXG5cdGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XHJcblx0Z2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XHJcblxyXG5cdHRyeSB7XHJcblx0XHRsZXQgc3VjY2VzcyA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpO1xyXG5cdFx0aWYgKCFzdWNjZXNzKSB0aHJvdyBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKTtcclxuXHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0Y29uc29sZS5lcnJvcihgV2ViR0xQcm9ncmFtOiAke2Vycm9yfWApO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHByb2dyYW07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBnZXQgdW5pZm9ybSBsb2NhdGlvbnNcclxuICpcclxuICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsXHJcbiAqIEBwYXJhbSB7V2ViR0xQcm9ncmFtfSBwcm9ncmFtXHJcbiAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fSBkYXRhXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcclxuICpcclxuICogQHJldHVybnMge29iamVjdH0gdW5pZm9ybUxvY2F0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnVmZmVyKGdsLCBwcm9ncmFtLCBkYXRhLCBzdHIpIHtcclxuXHRjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRjb25zdCBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIHN0cik7XHJcblxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xyXG5cdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBkYXRhLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG5cdHJldHVybiB7IGJ1ZmZlciwgbG9jYXRpb24gfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGNyZWF0ZSBpbmRleGJ1ZmZlclxyXG4gKlxyXG4gKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW1cclxuICogQHBhcmFtIHtVaW50MTZBcnJheSB8IFVpbnQzMkFycmF5fSBkYXRhXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcclxuICpcclxuICogQHJldHVybnMge29iamVjdH0gdW5pZm9ybUxvY2F0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5kZXgoZ2wsIGluZGljZXMpIHtcclxuXHRjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBidWZmZXIpO1xyXG5cdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXMsIGdsLlNUQVRJQ19EUkFXKTtcclxuXHJcblx0Y29uc3QgY250ID0gaW5kaWNlcy5sZW5ndGg7XHJcblx0cmV0dXJuIHsgY250LCBidWZmZXIgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gKiBAcGFyYW0ge1dlYkdMQnVmZmVyfSBidWZmZXJcclxuICogQHBhcmFtIHtOdW1iZXJ9IGxvY2F0aW9uXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzaXplXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbm9ybWFsaXplZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQnVmZmVyKFxyXG5cdGdsLFxyXG5cdGJ1ZmZlcixcclxuXHRsb2NhdGlvbiA9IDAsXHJcblx0c2l6ZSA9IDEsXHJcblx0dHlwZSA9IEZMT0FULFxyXG5cdG5vcm1hbGl6ZWQgPSBmYWxzZSxcclxuXHRzdHJpZGUgPSAwLFxyXG5cdG9mZnNldCA9IDBcclxuKSB7XHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZCwgc3RyaWRlLCBvZmZzZXQpO1xyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcclxufVxyXG4iLCJpbXBvcnQgeyBSR0IsIFVOU0lHTkVEX0JZVEUsIENMQU1QX1RPX0VER0UgfSBmcm9tICcuLi9jb25zdHMnO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIGNyZWF0ZSBlbXB0eSB0ZXh0dXJlXHJcbiAqXHJcbiAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gKiBAcGFyYW0geyp9IHRhcmdldFRleHR1cmVXaWR0aFxyXG4gKiBAcGFyYW0geyp9IHRhcmdldFRleHR1cmVIZWlnaHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbXB0eVRleHR1cmUoXHJcblx0Z2wsXHJcblx0dGV4dHVyZVdpZHRoLFxyXG5cdHRleHR1cmVIZWlnaHQsXHJcblx0Zm9ybWF0ID0gUkdCLFxyXG5cdG1pbkZpbHRlciA9IExJTkVBUixcclxuXHRtYWdGaWx0ZXIgPSBMSU5FQVIsXHJcblx0d3JhcFMgPSBDTEFNUF9UT19FREdFLFxyXG5cdHdyYXBUID0gQ0xBTVBfVE9fRURHRSxcclxuXHR0eXBlID0gVU5TSUdORURfQllURVxyXG4pIHtcclxuXHRjb25zdCB0YXJnZXRUZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRhcmdldFRleHR1cmUpO1xyXG5cclxuXHQvLyBkZWZpbmUgc2l6ZSBhbmQgZm9ybWF0IG9mIGxldmVsIDBcclxuXHRjb25zdCBsZXZlbCA9IDA7XHJcblx0Y29uc3QgYm9yZGVyID0gMDtcclxuXHQvLyBjb25zdCB0eXBlID0gZ2wuVU5TSUdORURfQllURTtcclxuXHRjb25zdCBkYXRhID0gbnVsbDtcclxuXHJcblx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYkdMUmVuZGVyaW5nQ29udGV4dC90ZXhJbWFnZTJEXHJcblx0Z2wudGV4SW1hZ2UyRChcclxuXHRcdGdsLlRFWFRVUkVfMkQsXHJcblx0XHQwLFxyXG5cdFx0Z2wuREVQVEhfQ09NUE9ORU5ULFxyXG5cdFx0dGV4dHVyZVdpZHRoLFxyXG5cdFx0dGV4dHVyZVdpZHRoLFxyXG5cdFx0MCxcclxuXHRcdGdsLkRFUFRIX0NPTVBPTkVOVCxcclxuXHRcdGdsLlVOU0lHTkVEX1NIT1JULFxyXG5cdFx0bnVsbFxyXG5cdCAgKTtcclxuXHQgIFxyXG5cdGNvbnNvbGUubG9nKGZvcm1hdCk7XHJcblx0aWYoZ2wuREVQVEhfQ09NUE9ORU5UID09PSBmb3JtYXQpIGNvbnNvbGUubG9nKCdmb3JtYXQgaXMgREVQVEhfQ09NUE9ORU5UJyk7XHJcblxyXG5cdC8vIHNldCB0aGUgZmlsdGVyaW5nIHNvIHdlIGRvbid0IG5lZWQgbWlwc1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBtaW5GaWx0ZXIpO1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBtYWdGaWx0ZXIpO1xyXG5cdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIHdyYXBTKTtcclxuXHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCB3cmFwVCk7XHJcblxyXG5cdHJldHVybiB0YXJnZXRUZXh0dXJlO1xyXG59XHJcblxyXG4vKipcclxuICogY3JlYXRlIHRleHR1cmUgZnJvbSBpbWFnZVxyXG4gKlxyXG4gKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICogQHBhcmFtIHtJbWFnZX0gaW1hZ2VcclxuICogQHBhcmFtIHtudW1iZXJ9IGZvcm1hdFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzRmxpcFxyXG4gKlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUltYWdlVGV4dHVyZShnbCwgaW1hZ2UsIGZvcm1hdCA9IFJHQiwgaXNGbGlwID0gZmFsc2UsIGlzTWlwbWFwID0gZmFsc2UpIHtcclxuXHRsZXQgdGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuXHRnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcclxuXHRnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCBpc0ZsaXApO1xyXG5cdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZm9ybWF0LCBmb3JtYXQsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcclxuXHJcblx0aWYgKGlzUG93ZXJPZjIoaW1hZ2Uud2lkdGgpICYmIGlzUG93ZXJPZjIoaW1hZ2UuaGVpZ2h0KSAmJiBpc01pcG1hcCkge1xyXG5cdFx0Ly8gWWVzLCBpdCdzIGEgcG93ZXIgb2YgMi4gR2VuZXJhdGUgbWlwcy5cclxuXHRcdGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBObywgaXQncyBub3QgYSBwb3dlciBvZiAyLiBUdXJuIG9mIG1pcHMgYW5kIHNldFxyXG5cdFx0Ly8gd3JhcHBpbmcgdG8gY2xhbXAgdG8gZWRnZVxyXG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRleHR1cmU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleHR1cmVcclxuICogQHBhcmFtIHtJbWFnZX0gaW1hZ2VcclxuICogQHBhcmFtIHtudW1iZXJ9IGZvcm1hdFxyXG4gKlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUltYWdlVGV4dHVyZShnbCwgdGV4dHVyZSwgaW1hZ2UsIGZvcm1hdCA9IFJHQikge1xyXG5cdGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xyXG5cdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG5cdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZm9ybWF0LCBmb3JtYXQsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcclxuXHJcblx0aWYgKGlzUG93ZXJPZjIoaW1hZ2Uud2lkdGgpICYmIGlzUG93ZXJPZjIoaW1hZ2UuaGVpZ2h0KSkge1xyXG5cdFx0Ly8gWWVzLCBpdCdzIGEgcG93ZXIgb2YgMi4gR2VuZXJhdGUgbWlwcy5cclxuXHRcdGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBObywgaXQncyBub3QgYSBwb3dlciBvZiAyLiBUdXJuIG9mIG1pcHMgYW5kIHNldFxyXG5cdFx0Ly8gd3JhcHBpbmcgdG8gY2xhbXAgdG8gZWRnZVxyXG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gaXNQb3dlck9mMih2YWx1ZSkge1xyXG5cdHJldHVybiAodmFsdWUgJiAodmFsdWUgLSAxKSkgPT0gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4dHVyZVxyXG4gKiBAcGFyYW0ge1dlYkdMVW5pZm9ybUxvY2F0aW9ufSB1bmlmb3JtTG9jYXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IHRleHR1cmVOdW1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmVUZXh0dXJlKGdsLCB0ZXh0dXJlLCB1bmlmb3JtTG9jYXRpb24sIHRleHR1cmVOdW0gPSAwKSB7XHJcblx0bGV0IGFjdGl2ZVRleHR1cmVOdW0gPSBnbC5URVhUVVJFMCArIHRleHR1cmVOdW07XHJcblx0Z2wuYWN0aXZlVGV4dHVyZShhY3RpdmVUZXh0dXJlTnVtKTtcclxuXHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcclxuXHRnbC51bmlmb3JtMWkodW5pZm9ybUxvY2F0aW9uLCB0ZXh0dXJlTnVtKTtcclxufVxyXG4iLCIvKipcclxuICogbG9hZCBqc29uIGZpbGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRBamF4SnNvbih1cmwpIHtcclxuXHRsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0bGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcblx0XHQvLyAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG5cclxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XHJcblx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xyXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ3hociBkb25lIHN1Y2Nlc3NmdWxseScpO1xyXG5cclxuXHRcdFx0XHRcdHZhciByZXNwID0geGhyLnJlc3BvbnNlVGV4dDtcclxuXHRcdFx0XHRcdHZhciByZXNwSnNvbiA9IEpTT04ucGFyc2UocmVzcCk7XHJcblx0XHRcdFx0XHRyZXNvbHZlKHJlc3BKc29uKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmVqZWN0KHhoci5zdGF0dXMpO1xyXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ3hociBmYWlsZWQnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ3hociBwcm9jZXNzaW5nIGdvaW5nIG9uJyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0eGhyLnNlbmQoKTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIHByb21pc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBsb2FkIGFzc2V0IGltYWdlXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gaW1hZ2VVcmxcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJbWFnZShpbWFnZVVybCkge1xyXG5cdGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0bGV0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcblx0XHRpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcblx0XHRcdHJlc29sdmUoaW1hZ2UpO1xyXG5cdFx0fTtcclxuXHRcdGltYWdlLm9uZXJyb3IgPSAoKSA9PiB7XHJcblx0XHRcdHJlamVjdCgnaW1hZ2UgaXMgbm90IGxvYWRlZCcpO1xyXG5cdFx0fTtcclxuXHJcblx0XHRpbWFnZS5zcmMgPSBpbWFnZVVybDtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIHByb21pc2U7XHJcbn1cclxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldFNwaGVyZShyYWRpdXMgPSAyLCBsYXRpdHVkZUJhbmRzID0gNjQsIGxvbmdpdHVkZUJhbmRzID0gNjQpIHtcclxuXHR2YXIgdmVydGljZXMgPSBbXTtcclxuXHR2YXIgdGV4dHVyZXMgPSBbXTtcclxuXHR2YXIgbm9ybWFscyA9IFtdO1xyXG5cdHZhciBpbmRpY2VzID0gW107XHJcblxyXG5cdGZvciAodmFyIGxhdE51bWJlciA9IDA7IGxhdE51bWJlciA8PSBsYXRpdHVkZUJhbmRzOyArK2xhdE51bWJlcikge1xyXG5cdFx0dmFyIHRoZXRhID0gKGxhdE51bWJlciAqIE1hdGguUEkpIC8gbGF0aXR1ZGVCYW5kcztcclxuXHRcdHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcclxuXHRcdHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcclxuXHJcblx0XHRmb3IgKHZhciBsb25nTnVtYmVyID0gMDsgbG9uZ051bWJlciA8PSBsb25naXR1ZGVCYW5kczsgKytsb25nTnVtYmVyKSB7XHJcblx0XHRcdHZhciBwaGkgPSAobG9uZ051bWJlciAqIDIgKiBNYXRoLlBJKSAvIGxvbmdpdHVkZUJhbmRzO1xyXG5cdFx0XHR2YXIgc2luUGhpID0gTWF0aC5zaW4ocGhpKTtcclxuXHRcdFx0dmFyIGNvc1BoaSA9IE1hdGguY29zKHBoaSk7XHJcblxyXG5cdFx0XHR2YXIgeCA9IGNvc1BoaSAqIHNpblRoZXRhO1xyXG5cdFx0XHR2YXIgeSA9IGNvc1RoZXRhO1xyXG5cdFx0XHR2YXIgeiA9IHNpblBoaSAqIHNpblRoZXRhO1xyXG5cdFx0XHR2YXIgdSA9IDEgLSBsb25nTnVtYmVyIC8gbG9uZ2l0dWRlQmFuZHM7XHJcblx0XHRcdHZhciB2ID0gMSAtIGxhdE51bWJlciAvIGxhdGl0dWRlQmFuZHM7XHJcblxyXG5cdFx0XHRub3JtYWxzLnB1c2goeCwgeSwgeik7XHJcblx0XHRcdHRleHR1cmVzLnB1c2godSwgdik7XHJcblx0XHRcdHZlcnRpY2VzLnB1c2gocmFkaXVzICogeCwgcmFkaXVzICogeSwgcmFkaXVzICogeik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmb3IgKGxhdE51bWJlciA9IDA7IGxhdE51bWJlciA8IGxhdGl0dWRlQmFuZHM7ICsrbGF0TnVtYmVyKSB7XHJcblx0XHRmb3IgKGxvbmdOdW1iZXIgPSAwOyBsb25nTnVtYmVyIDwgbG9uZ2l0dWRlQmFuZHM7ICsrbG9uZ051bWJlcikge1xyXG5cdFx0XHR2YXIgZmlyc3QgPSBsYXROdW1iZXIgKiAobG9uZ2l0dWRlQmFuZHMgKyAxKSArIGxvbmdOdW1iZXI7XHJcblx0XHRcdHZhciBzZWNvbmQgPSBmaXJzdCArIGxvbmdpdHVkZUJhbmRzICsgMTtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKHNlY29uZCwgZmlyc3QsIGZpcnN0ICsgMSwgc2Vjb25kICsgMSwgc2Vjb25kLCBmaXJzdCArIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHZlcnRpY2VzOiB2ZXJ0aWNlcyxcclxuXHRcdHV2czogdGV4dHVyZXMsXHJcblx0XHRub3JtYWxzOiBub3JtYWxzLFxyXG5cdFx0aW5kaWNlczogaW5kaWNlc1xyXG5cdH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGFuZSh3aWR0aCwgaGVpZ2h0LCB3aWR0aFNlZ21lbnQsIGhlaWdodFNlZ21lbnQpIHtcclxuXHRsZXQgdmVydGljZXMgPSBbXTtcclxuXHRsZXQgeFJhdGUgPSAxIC8gd2lkdGhTZWdtZW50O1xyXG5cdGxldCB5UmF0ZSA9IDEgLyBoZWlnaHRTZWdtZW50O1xyXG5cclxuXHQvLyBzZXQgdmVydGljZXMgYW5kIGJhcnljZW50cmljIHZlcnRpY2VzXHJcblx0Zm9yIChsZXQgeXkgPSAwOyB5eSA8PSBoZWlnaHRTZWdtZW50OyB5eSsrKSB7XHJcblx0XHRsZXQgeVBvcyA9ICgtMC41ICsgeVJhdGUgKiB5eSkgKiBoZWlnaHQ7XHJcblxyXG5cdFx0Zm9yIChsZXQgeHggPSAwOyB4eCA8PSB3aWR0aFNlZ21lbnQ7IHh4KyspIHtcclxuXHRcdFx0bGV0IHhQb3MgPSAoLTAuNSArIHhSYXRlICogeHgpICogd2lkdGg7XHJcblx0XHRcdHZlcnRpY2VzLnB1c2goeFBvcyk7XHJcblx0XHRcdHZlcnRpY2VzLnB1c2goeVBvcyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRsZXQgaW5kaWNlcyA9IFtdO1xyXG5cclxuXHRmb3IgKGxldCB5eSA9IDA7IHl5IDwgaGVpZ2h0U2VnbWVudDsgeXkrKykge1xyXG5cdFx0Zm9yIChsZXQgeHggPSAwOyB4eCA8IHdpZHRoU2VnbWVudDsgeHgrKykge1xyXG5cdFx0XHRsZXQgcm93U3RhcnROdW0gPSB5eSAqICh3aWR0aFNlZ21lbnQgKyAxKTtcclxuXHRcdFx0bGV0IG5leHRSb3dTdGFydE51bSA9ICh5eSArIDEpICogKHdpZHRoU2VnbWVudCArIDEpO1xyXG5cclxuXHRcdFx0aW5kaWNlcy5wdXNoKHJvd1N0YXJ0TnVtICsgeHgpO1xyXG5cdFx0XHRpbmRpY2VzLnB1c2gocm93U3RhcnROdW0gKyB4eCArIDEpO1xyXG5cdFx0XHRpbmRpY2VzLnB1c2gobmV4dFJvd1N0YXJ0TnVtICsgeHgpO1xyXG5cclxuXHRcdFx0aW5kaWNlcy5wdXNoKHJvd1N0YXJ0TnVtICsgeHggKyAxKTtcclxuXHRcdFx0aW5kaWNlcy5wdXNoKG5leHRSb3dTdGFydE51bSArIHh4ICsgMSk7XHJcblx0XHRcdGluZGljZXMucHVzaChuZXh0Um93U3RhcnROdW0gKyB4eCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0dmVydGljZXM6IHZlcnRpY2VzLFxyXG5cdFx0aW5kaWNlczogaW5kaWNlc1xyXG5cdH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBtZXJnZSBnZW9tZXRyaWVzIGludG8gb25lIGdlb21ldHJ5XHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGdlb21ldHJpZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUdlb210b3J5KGdlb21ldHJpZXMpIHtcclxuXHRsZXQgdmVydGljZXMgPSBbXSxcclxuXHRcdG5vcm1hbHMgPSBbXSxcclxuXHRcdHV2cyA9IFtdLFxyXG5cdFx0aW5kaWNlcyA9IFtdO1xyXG5cclxuXHRsZXQgbGFzdFZlcnRpY2VzID0gMDtcclxuXHJcblx0Zm9yIChsZXQgaWkgPSAwOyBpaSA8IGdlb21ldHJpZXMubGVuZ3RoOyBpaSsrKSB7XHJcblx0XHRsZXQgZ2VvbWV0cnkgPSBnZW9tZXRyaWVzW2lpXTtcclxuXHJcblx0XHRpZiAoZ2VvbWV0cmllcy5pbmRpY2VzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgaWkgPSAwOyBpaSwgZ2VvbWV0cmllcy5pbmRpY2VzLmxlbmd0aDsgaWkrKykge1xyXG5cdFx0XHRcdGluZGljZXMucHVzaChnZW9tZXRyeS5pbmRpY2VzW2lpXSArIGxhc3RWZXJ0aWNlcyAvIDMpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgaWkgPSAwOyBpaSA8IGdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaWkrKykge1xyXG5cdFx0XHRcdHZlcnRpY2VzLnB1c2goZ2VvbWV0cnkudmVydGljZXNbaWldKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGFzdFZlcnRpY2VzICs9IGdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZ2VvbWV0cnkubm9ybWFscy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAobGV0IGlpID0gMDsgaWkgPCBnZW9tZXRyeS5ub3JtYWxzLmxlbmd0aDsgaWkrKykge1xyXG5cdFx0XHRcdG5vcm1hbHMucHVzaChnZW9tZXRyeS5ub3JtYWxzW2lpXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZ2VvbWV0cnkudXZzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgaWkgPSAwOyBpaSA8IGdlb21ldHJ5LnV2cy5sZW5ndGg7IGlpKyspIHtcclxuXHRcdFx0XHR1dnMucHVzaChnZW9tZXRyeS51dnNbaWldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHZlcnRpY2VzOiB2ZXJ0aWNlcyxcclxuXHRcdG5vcm1hbHM6IG5vcm1hbHMsXHJcblx0XHR1dnM6IHV2cyxcclxuXHRcdGluZGljZXM6IGluZGljZXNcclxuXHR9O1xyXG59XHJcbiIsIi8vIHNlZ21lbnQgaXMgb25lXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaW1wbGVCb3god2lkdGgsIGhlaWdodCwgZGVwdGgpIHtcclxuXHRsZXQgeCA9IC13aWR0aCAvIDI7XHJcblx0bGV0IHkgPSAtaGVpZ2h0IC8gMjtcclxuXHRsZXQgeiA9IC1kZXB0aCAvIDI7XHJcblxyXG5cdGxldCBmYmwgPSB7XHJcblx0XHR4OiB4LFxyXG5cdFx0eTogeSxcclxuXHRcdHo6IHogKyBkZXB0aFxyXG5cdH07XHJcblx0bGV0IGZiciA9IHtcclxuXHRcdHg6IHggKyB3aWR0aCxcclxuXHRcdHk6IHksXHJcblx0XHR6OiB6ICsgZGVwdGhcclxuXHR9O1xyXG5cdGxldCBmdGwgPSB7XHJcblx0XHR4OiB4LFxyXG5cdFx0eTogeSArIGhlaWdodCxcclxuXHRcdHo6IHogKyBkZXB0aFxyXG5cdH07XHJcblx0bGV0IGZ0ciA9IHtcclxuXHRcdHg6IHggKyB3aWR0aCxcclxuXHRcdHk6IHkgKyBoZWlnaHQsXHJcblx0XHR6OiB6ICsgZGVwdGhcclxuXHR9O1xyXG5cdGxldCBiYmwgPSB7XHJcblx0XHR4OiB4LFxyXG5cdFx0eTogeSxcclxuXHRcdHo6IHpcclxuXHR9O1xyXG5cdGxldCBiYnIgPSB7XHJcblx0XHR4OiB4ICsgd2lkdGgsXHJcblx0XHR5OiB5LFxyXG5cdFx0ejogelxyXG5cdH07XHJcblx0bGV0IGJ0bCA9IHtcclxuXHRcdHg6IHgsXHJcblx0XHR5OiB5ICsgaGVpZ2h0LFxyXG5cdFx0ejogelxyXG5cdH07XHJcblx0bGV0IGJ0ciA9IHtcclxuXHRcdHg6IHggKyB3aWR0aCxcclxuXHRcdHk6IHkgKyBoZWlnaHQsXHJcblx0XHR6OiB6XHJcblx0fTtcclxuXHJcblx0bGV0IHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG5cdFx0Ly9mcm9udFxyXG5cdFx0ZmJsLngsXHJcblx0XHRmYmwueSxcclxuXHRcdGZibC56LFxyXG5cdFx0ZmJyLngsXHJcblx0XHRmYnIueSxcclxuXHRcdGZici56LFxyXG5cdFx0ZnRsLngsXHJcblx0XHRmdGwueSxcclxuXHRcdGZ0bC56LFxyXG5cdFx0ZnRsLngsXHJcblx0XHRmdGwueSxcclxuXHRcdGZ0bC56LFxyXG5cdFx0ZmJyLngsXHJcblx0XHRmYnIueSxcclxuXHRcdGZici56LFxyXG5cdFx0ZnRyLngsXHJcblx0XHRmdHIueSxcclxuXHRcdGZ0ci56LFxyXG5cclxuXHRcdC8vcmlnaHRcclxuXHRcdGZici54LFxyXG5cdFx0ZmJyLnksXHJcblx0XHRmYnIueixcclxuXHRcdGJici54LFxyXG5cdFx0YmJyLnksXHJcblx0XHRiYnIueixcclxuXHRcdGZ0ci54LFxyXG5cdFx0ZnRyLnksXHJcblx0XHRmdHIueixcclxuXHRcdGZ0ci54LFxyXG5cdFx0ZnRyLnksXHJcblx0XHRmdHIueixcclxuXHRcdGJici54LFxyXG5cdFx0YmJyLnksXHJcblx0XHRiYnIueixcclxuXHRcdGJ0ci54LFxyXG5cdFx0YnRyLnksXHJcblx0XHRidHIueixcclxuXHJcblx0XHQvL2JhY2tcclxuXHRcdGZici54LFxyXG5cdFx0YmJyLnksXHJcblx0XHRiYnIueixcclxuXHRcdGJibC54LFxyXG5cdFx0YmJsLnksXHJcblx0XHRiYmwueixcclxuXHRcdGJ0ci54LFxyXG5cdFx0YnRyLnksXHJcblx0XHRidHIueixcclxuXHRcdGJ0ci54LFxyXG5cdFx0YnRyLnksXHJcblx0XHRidHIueixcclxuXHRcdGJibC54LFxyXG5cdFx0YmJsLnksXHJcblx0XHRiYmwueixcclxuXHRcdGJ0bC54LFxyXG5cdFx0YnRsLnksXHJcblx0XHRidGwueixcclxuXHJcblx0XHQvL2xlZnRcclxuXHRcdGJibC54LFxyXG5cdFx0YmJsLnksXHJcblx0XHRiYmwueixcclxuXHRcdGZibC54LFxyXG5cdFx0ZmJsLnksXHJcblx0XHRmYmwueixcclxuXHRcdGJ0bC54LFxyXG5cdFx0YnRsLnksXHJcblx0XHRidGwueixcclxuXHRcdGJ0bC54LFxyXG5cdFx0YnRsLnksXHJcblx0XHRidGwueixcclxuXHRcdGZibC54LFxyXG5cdFx0ZmJsLnksXHJcblx0XHRmYmwueixcclxuXHRcdGZ0bC54LFxyXG5cdFx0ZnRsLnksXHJcblx0XHRmdGwueixcclxuXHJcblx0XHQvL3RvcFxyXG5cdFx0ZnRsLngsXHJcblx0XHRmdGwueSxcclxuXHRcdGZ0bC56LFxyXG5cdFx0ZnRyLngsXHJcblx0XHRmdHIueSxcclxuXHRcdGZ0ci56LFxyXG5cdFx0YnRsLngsXHJcblx0XHRidGwueSxcclxuXHRcdGJ0bC56LFxyXG5cdFx0YnRsLngsXHJcblx0XHRidGwueSxcclxuXHRcdGJ0bC56LFxyXG5cdFx0ZnRyLngsXHJcblx0XHRmdHIueSxcclxuXHRcdGZ0ci56LFxyXG5cdFx0YnRyLngsXHJcblx0XHRidHIueSxcclxuXHRcdGJ0ci56LFxyXG5cclxuXHRcdC8vYm90dG9tXHJcblx0XHRiYmwueCxcclxuXHRcdGJibC55LFxyXG5cdFx0YmJsLnosXHJcblx0XHRiYnIueCxcclxuXHRcdGJici55LFxyXG5cdFx0YmJyLnosXHJcblx0XHRmYmwueCxcclxuXHRcdGZibC55LFxyXG5cdFx0ZmJsLnosXHJcblx0XHRmYmwueCxcclxuXHRcdGZibC55LFxyXG5cdFx0ZmJsLnosXHJcblx0XHRiYnIueCxcclxuXHRcdGJici55LFxyXG5cdFx0YmJyLnosXHJcblx0XHRmYnIueCxcclxuXHRcdGZici55LFxyXG5cdFx0ZmJyLnpcclxuXHRdKTtcclxuXHJcblx0bGV0IGxheW91dFBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShbXHJcblx0XHQvLyBmcm9udFxyXG5cdFx0MSxcclxuXHRcdDIsXHJcblx0XHQvL1xyXG5cdFx0MixcclxuXHRcdDIsXHJcblx0XHQvL1xyXG5cdFx0MSxcclxuXHRcdDEsXHJcblx0XHQvL1xyXG5cdFx0Ly9cclxuXHRcdDEsXHJcblx0XHQxLFxyXG5cdFx0Ly9cclxuXHRcdDIsXHJcblx0XHQyLFxyXG5cdFx0Ly9cclxuXHRcdDIsXHJcblx0XHQxLFxyXG5cdFx0Ly9cclxuXHRcdC8vIHJpZ2h0XHJcblx0XHQvL1xyXG5cdFx0MSArIDEsXHJcblx0XHQyLFxyXG5cdFx0Ly9cclxuXHRcdDIgKyAxLFxyXG5cdFx0MixcclxuXHRcdC8vXHJcblx0XHQxICsgMSxcclxuXHRcdDEsXHJcblx0XHQvL1xyXG5cdFx0Ly9cclxuXHRcdDEgKyAxLFxyXG5cdFx0MSxcclxuXHRcdC8vXHJcblx0XHQyICsgMSxcclxuXHRcdDIsXHJcblx0XHQvL1xyXG5cdFx0MiArIDEsXHJcblx0XHQxLFxyXG5cdFx0Ly9cclxuXHRcdC8vIGJhY2tcclxuXHRcdC8vXHJcblx0XHQxICsgMixcclxuXHRcdDIsXHJcblx0XHQvL1xyXG5cdFx0MiArIDIsXHJcblx0XHQyLFxyXG5cdFx0Ly9cclxuXHRcdDEgKyAyLFxyXG5cdFx0MSxcclxuXHRcdC8vXHJcblx0XHQvL1xyXG5cdFx0MSArIDIsXHJcblx0XHQxLFxyXG5cdFx0Ly9cclxuXHRcdDIgKyAyLFxyXG5cdFx0MixcclxuXHRcdC8vXHJcblx0XHQyICsgMixcclxuXHRcdDEsXHJcblx0XHQvL1xyXG5cdFx0Ly9cclxuXHRcdC8vIGJhY2tcclxuXHRcdC8vXHJcblx0XHQxIC0gMSxcclxuXHRcdDIsXHJcblx0XHQvL1xyXG5cdFx0MiAtIDEsXHJcblx0XHQyLFxyXG5cdFx0Ly9cclxuXHRcdDEgLSAxLFxyXG5cdFx0MSxcclxuXHRcdC8vXHJcblx0XHQvL1xyXG5cdFx0MSAtIDEsXHJcblx0XHQxLFxyXG5cdFx0Ly9cclxuXHRcdDIgLSAxLFxyXG5cdFx0MixcclxuXHRcdC8vXHJcblx0XHQyIC0gMSxcclxuXHRcdDEsXHJcblx0XHQvL1xyXG5cdFx0Ly8gdG9wXHJcblx0XHQvL1xyXG5cdFx0MSxcclxuXHRcdDIgLSAxLFxyXG5cdFx0Ly9cclxuXHRcdDIsXHJcblx0XHQyIC0gMSxcclxuXHRcdC8vXHJcblx0XHQxLFxyXG5cdFx0MSAtIDEsXHJcblx0XHQvL1xyXG5cdFx0Ly9cclxuXHRcdDEsXHJcblx0XHQxIC0gMSxcclxuXHRcdC8vXHJcblx0XHQyLFxyXG5cdFx0MiAtIDEsXHJcblx0XHQvL1xyXG5cdFx0MixcclxuXHRcdDEgLSAxLFxyXG5cdFx0Ly9cclxuXHRcdC8vIGJvdHRvbVxyXG5cdFx0Ly9cclxuXHRcdDEsXHJcblx0XHQyICsgMSxcclxuXHRcdC8vXHJcblx0XHQyLFxyXG5cdFx0MiArIDEsXHJcblx0XHQvL1xyXG5cdFx0MSxcclxuXHRcdDEgKyAxLFxyXG5cdFx0Ly9cclxuXHRcdC8vXHJcblx0XHQxLFxyXG5cdFx0MSArIDEsXHJcblx0XHQvL1xyXG5cdFx0MixcclxuXHRcdDIgKyAxLFxyXG5cdFx0Ly9cclxuXHRcdDIsXHJcblx0XHQxICsgMVxyXG5cdFx0Ly9cclxuXHRdKTtcclxuXHJcblx0bGV0IHV2cyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG5cdFx0Ly9mcm9udFxyXG5cdFx0MCxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQxLFxyXG5cclxuXHRcdC8vcmlnaHRcclxuXHRcdDAsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MSxcclxuXHJcblx0XHQvL2JhY2tcclxuXHRcdDAsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MSxcclxuXHJcblx0XHQvL2xlZnRcclxuXHRcdDAsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MSxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MSxcclxuXHJcblx0XHQvL3RvcFxyXG5cdFx0MCxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQxLFxyXG5cclxuXHRcdC8vYm90dG9tXHJcblx0XHQwLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQwLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDEsXHJcblx0XHQwLFxyXG5cdFx0MSxcclxuXHRcdDFcclxuXHRdKTtcclxuXHJcblx0bGV0IG5vcm1hbHMgPSBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucy5sZW5ndGgpO1xyXG5cdGxldCBpLCBjb3VudDtcclxuXHRsZXQgbmk7XHJcblxyXG5cdGZvciAoaSA9IDAsIGNvdW50ID0gcG9zaXRpb25zLmxlbmd0aCAvIDM7IGkgPCBjb3VudDsgaSsrKSB7XHJcblx0XHRuaSA9IGkgKiAzO1xyXG5cclxuXHRcdG5vcm1hbHNbbmldID0gcGFyc2VJbnQoaSAvIDYsIDEwKSA9PT0gMSA/IDEgOiBwYXJzZUludChpIC8gNiwgMTApID09PSAzID8gLTEgOiAwO1xyXG5cclxuXHRcdG5vcm1hbHNbbmkgKyAxXSA9IHBhcnNlSW50KGkgLyA2LCAxMCkgPT09IDQgPyAxIDogcGFyc2VJbnQoaSAvIDYsIDEwKSA9PT0gNSA/IC0xIDogMDtcclxuXHJcblx0XHRub3JtYWxzW25pICsgMl0gPSBwYXJzZUludChpIC8gNiwgMTApID09PSAwID8gMSA6IHBhcnNlSW50KGkgLyA2LCAxMCkgPT09IDIgPyAtMSA6IDA7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0dmVydGljZXM6IHBvc2l0aW9ucyxcclxuXHRcdG5vcm1hbHM6IG5vcm1hbHMsXHJcblx0XHR1dnM6IHV2cyxcclxuXHRcdGxheW91dFBvc2l0aW9uOiBsYXlvdXRQb3NpdGlvblxyXG5cdH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaW1wbGVQbGFuZSh3aWR0aCwgaGVpZ2h0KSB7XHJcblx0bGV0IHggPSAtd2lkdGggLyAyO1xyXG5cdGxldCB5ID0gLWhlaWdodCAvIDI7XHJcblxyXG5cdGxldCBibCA9IHtcclxuXHRcdHg6IHgsXHJcblx0XHR5OiB5LFxyXG5cdFx0ejogMFxyXG5cdH07XHJcblx0bGV0IGJyID0ge1xyXG5cdFx0eDogeCArIHdpZHRoLFxyXG5cdFx0eTogeSxcclxuXHRcdHo6IDBcclxuXHR9O1xyXG5cdGxldCB0bCA9IHtcclxuXHRcdHg6IHgsXHJcblx0XHR5OiB5ICsgaGVpZ2h0LFxyXG5cdFx0ejogMFxyXG5cdH07XHJcblx0bGV0IHRyID0ge1xyXG5cdFx0eDogeCArIHdpZHRoLFxyXG5cdFx0eTogeSArIGhlaWdodCxcclxuXHRcdHo6IDBcclxuXHR9O1xyXG5cclxuXHRsZXQgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShbXHJcblx0XHRibC54LFxyXG5cdFx0YmwueSxcclxuXHRcdGJsLnosXHJcblx0XHRici54LFxyXG5cdFx0YnIueSxcclxuXHRcdGJyLnosXHJcblx0XHR0bC54LFxyXG5cdFx0dGwueSxcclxuXHRcdHRsLnosXHJcblx0XHR0bC54LFxyXG5cdFx0dGwueSxcclxuXHRcdHRsLnosXHJcblx0XHRici54LFxyXG5cdFx0YnIueSxcclxuXHRcdGJyLnosXHJcblx0XHR0ci54LFxyXG5cdFx0dHIueSxcclxuXHRcdHRyLnpcclxuXHRdKTtcclxuXHJcblx0bGV0IHV2cyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG5cdFx0Ly9mcm9udFxyXG5cdFx0MCxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDAsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQxLFxyXG5cdFx0MCxcclxuXHRcdDEsXHJcblx0XHQxXHJcblx0XSk7XHJcblxyXG5cdGxldCBub3JtYWxzID0gbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0pO1xyXG5cdC8vIGxldCBpbmRpY2VzID0gWzAsIDEsIDNdO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0dmVydGljZXM6IHBvc2l0aW9ucyxcclxuXHRcdG5vcm1hbHM6IG5vcm1hbHMsXHJcblx0XHR1dnM6IHV2c1xyXG5cdH07XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcclxuZXhwb3J0IGxldCBBUlJBWV9UWVBFID0gdHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcclxuZXhwb3J0IGNvbnN0IFJBTkRPTSA9IE1hdGgucmFuZG9tO1xyXG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tICcuL2NvbW1vbic7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XHJcblx0aWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRvdXRbMV0gPSAwO1xyXG5cdFx0b3V0WzJdID0gMDtcclxuXHRcdG91dFszXSA9IDA7XHJcblx0XHRvdXRbNF0gPSAwO1xyXG5cdFx0b3V0WzZdID0gMDtcclxuXHRcdG91dFs3XSA9IDA7XHJcblx0XHRvdXRbOF0gPSAwO1xyXG5cdFx0b3V0WzldID0gMDtcclxuXHRcdG91dFsxMV0gPSAwO1xyXG5cdFx0b3V0WzEyXSA9IDA7XHJcblx0XHRvdXRbMTNdID0gMDtcclxuXHRcdG91dFsxNF0gPSAwO1xyXG5cdH1cclxuXHRvdXRbMF0gPSAxO1xyXG5cdG91dFs1XSA9IDE7XHJcblx0b3V0WzEwXSA9IDE7XHJcblx0b3V0WzE1XSA9IDE7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG5cdGxldCBhMDAgPSBhWzBdLFxyXG5cdFx0YTAxID0gYVsxXSxcclxuXHRcdGEwMiA9IGFbMl0sXHJcblx0XHRhMDMgPSBhWzNdO1xyXG5cdGxldCBhMTAgPSBhWzRdLFxyXG5cdFx0YTExID0gYVs1XSxcclxuXHRcdGExMiA9IGFbNl0sXHJcblx0XHRhMTMgPSBhWzddO1xyXG5cdGxldCBhMjAgPSBhWzhdLFxyXG5cdFx0YTIxID0gYVs5XSxcclxuXHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0YTIzID0gYVsxMV07XHJcblx0bGV0IGEzMCA9IGFbMTJdLFxyXG5cdFx0YTMxID0gYVsxM10sXHJcblx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdGEzMyA9IGFbMTVdO1xyXG5cdC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxyXG5cdGxldCBiMCA9IGJbMF0sXHJcblx0XHRiMSA9IGJbMV0sXHJcblx0XHRiMiA9IGJbMl0sXHJcblx0XHRiMyA9IGJbM107XHJcblx0b3V0WzBdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XHJcblx0b3V0WzFdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XHJcblx0b3V0WzJdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XHJcblx0b3V0WzNdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XHJcblx0YjAgPSBiWzRdO1xyXG5cdGIxID0gYls1XTtcclxuXHRiMiA9IGJbNl07XHJcblx0YjMgPSBiWzddO1xyXG5cdG91dFs0XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xyXG5cdG91dFs1XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xyXG5cdG91dFs2XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xyXG5cdG91dFs3XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xyXG5cdGIwID0gYls4XTtcclxuXHRiMSA9IGJbOV07XHJcblx0YjIgPSBiWzEwXTtcclxuXHRiMyA9IGJbMTFdO1xyXG5cdG91dFs4XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xyXG5cdG91dFs5XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xyXG5cdG91dFsxMF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcclxuXHRvdXRbMTFdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XHJcblx0YjAgPSBiWzEyXTtcclxuXHRiMSA9IGJbMTNdO1xyXG5cdGIyID0gYlsxNF07XHJcblx0YjMgPSBiWzE1XTtcclxuXHRvdXRbMTJdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XHJcblx0b3V0WzEzXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xyXG5cdG91dFsxNF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcclxuXHRvdXRbMTVdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kcy5cclxuICogUGFzc2luZyBudWxsL3VuZGVmaW5lZC9ubyB2YWx1ZSBmb3IgZmFyIHdpbGwgZ2VuZXJhdGUgaW5maW5pdGUgcHJvamVjdGlvbiBtYXRyaXguXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW0sIGNhbiBiZSBudWxsIG9yIEluZmluaXR5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICpcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZShvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XHJcblx0bGV0IGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXHJcblx0XHRuZjtcclxuXHRvdXRbMF0gPSBmIC8gYXNwZWN0O1xyXG5cdG91dFsxXSA9IDA7XHJcblx0b3V0WzJdID0gMDtcclxuXHRvdXRbM10gPSAwO1xyXG5cdG91dFs0XSA9IDA7XHJcblx0b3V0WzVdID0gZjtcclxuXHRvdXRbNl0gPSAwO1xyXG5cdG91dFs3XSA9IDA7XHJcblx0b3V0WzhdID0gMDtcclxuXHRvdXRbOV0gPSAwO1xyXG5cdG91dFsxMV0gPSAtMTtcclxuXHRvdXRbMTJdID0gMDtcclxuXHRvdXRbMTNdID0gMDtcclxuXHRvdXRbMTVdID0gMDtcclxuXHRpZiAoZmFyICE9IG51bGwgJiYgZmFyICE9PSBJbmZpbml0eSkge1xyXG5cdFx0bmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG5cdFx0b3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xyXG5cdFx0b3V0WzE0XSA9IDIgKiBmYXIgKiBuZWFyICogbmY7XHJcblx0fSBlbHNlIHtcclxuXHRcdG91dFsxMF0gPSAtMTtcclxuXHRcdG91dFsxNF0gPSAtMiAqIG5lYXI7XHJcblx0fVxyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcclxuXHRsZXQgbHIgPSAxIC8gKGxlZnQgLSByaWdodCk7XHJcblx0bGV0IGJ0ID0gMSAvIChib3R0b20gLSB0b3ApO1xyXG5cdGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XHJcblx0b3V0WzBdID0gLTIgKiBscjtcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IDA7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSAwO1xyXG5cdG91dFs1XSA9IC0yICogYnQ7XHJcblx0b3V0WzZdID0gMDtcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IDA7XHJcblx0b3V0WzldID0gMDtcclxuXHRvdXRbMTBdID0gMiAqIG5mO1xyXG5cdG91dFsxMV0gPSAwO1xyXG5cdG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xyXG5cdG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xyXG5cdG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcclxuXHRvdXRbMTVdID0gMTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XHJcblx0b3V0WzBdID0gMTtcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IDA7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSAwO1xyXG5cdG91dFs1XSA9IDE7XHJcblx0b3V0WzZdID0gMDtcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IDA7XHJcblx0b3V0WzldID0gMDtcclxuXHRvdXRbMTBdID0gMTtcclxuXHRvdXRbMTFdID0gMDtcclxuXHRvdXRbMTJdID0gMDtcclxuXHRvdXRbMTNdID0gMDtcclxuXHRvdXRbMTRdID0gMDtcclxuXHRvdXRbMTVdID0gMTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUobWF0KSB7XHJcblx0bGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcclxuXHRmb3IgKGxldCBpaSA9IDA7IGlpIDwgb3V0Lmxlbmd0aDsgaWkrKykge1xyXG5cdFx0b3V0W2lpXSA9IG1hdFtpaV07XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xyXG5cdG91dFswXSA9IDE7XHJcblx0b3V0WzFdID0gMDtcclxuXHRvdXRbMl0gPSAwO1xyXG5cdG91dFszXSA9IDA7XHJcblx0b3V0WzRdID0gMDtcclxuXHRvdXRbNV0gPSAxO1xyXG5cdG91dFs2XSA9IDA7XHJcblx0b3V0WzddID0gMDtcclxuXHRvdXRbOF0gPSAwO1xyXG5cdG91dFs5XSA9IDA7XHJcblx0b3V0WzEwXSA9IDE7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IHZbMF07XHJcblx0b3V0WzEzXSA9IHZbMV07XHJcblx0b3V0WzE0XSA9IHZbMl07XHJcblx0b3V0WzE1XSA9IDE7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRsZXQgcyA9IE1hdGguc2luKHJhZCk7XHJcblx0bGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xyXG5cdC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0b3V0WzBdID0gYztcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IC1zO1xyXG5cdG91dFszXSA9IDA7XHJcblx0b3V0WzRdID0gMDtcclxuXHRvdXRbNV0gPSAxO1xyXG5cdG91dFs2XSA9IDA7XHJcblx0b3V0WzddID0gMDtcclxuXHRvdXRbOF0gPSBzO1xyXG5cdG91dFs5XSA9IDA7XHJcblx0b3V0WzEwXSA9IGM7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IDA7XHJcblx0b3V0WzEzXSA9IDA7XHJcblx0b3V0WzE0XSA9IDA7XHJcblx0b3V0WzE1XSA9IDE7XHJcblxyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcclxuXHRsZXQgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuO1xyXG5cdGxldCBleWV4ID0gZXllWzBdO1xyXG5cdGxldCBleWV5ID0gZXllWzFdO1xyXG5cdGxldCBleWV6ID0gZXllWzJdO1xyXG5cdGxldCB1cHggPSB1cFswXTtcclxuXHRsZXQgdXB5ID0gdXBbMV07XHJcblx0bGV0IHVweiA9IHVwWzJdO1xyXG5cdGxldCBjZW50ZXJ4ID0gY2VudGVyWzBdO1xyXG5cdGxldCBjZW50ZXJ5ID0gY2VudGVyWzFdO1xyXG5cdGxldCBjZW50ZXJ6ID0gY2VudGVyWzJdO1xyXG5cclxuXHRpZiAoXHJcblx0XHRNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXHJcblx0XHRNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXHJcblx0XHRNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBnbE1hdHJpeC5FUFNJTE9OXHJcblx0KSB7XHJcblx0XHRyZXR1cm4gaWRlbnRpdHkob3V0KTtcclxuXHR9XHJcblxyXG5cdHowID0gZXlleCAtIGNlbnRlcng7XHJcblx0ejEgPSBleWV5IC0gY2VudGVyeTtcclxuXHR6MiA9IGV5ZXogLSBjZW50ZXJ6O1xyXG5cclxuXHRsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XHJcblx0ejAgKj0gbGVuO1xyXG5cdHoxICo9IGxlbjtcclxuXHR6MiAqPSBsZW47XHJcblxyXG5cdHgwID0gdXB5ICogejIgLSB1cHogKiB6MTtcclxuXHR4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XHJcblx0eDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xyXG5cdGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpO1xyXG5cdGlmICghbGVuKSB7XHJcblx0XHR4MCA9IDA7XHJcblx0XHR4MSA9IDA7XHJcblx0XHR4MiA9IDA7XHJcblx0fSBlbHNlIHtcclxuXHRcdGxlbiA9IDEgLyBsZW47XHJcblx0XHR4MCAqPSBsZW47XHJcblx0XHR4MSAqPSBsZW47XHJcblx0XHR4MiAqPSBsZW47XHJcblx0fVxyXG5cclxuXHR5MCA9IHoxICogeDIgLSB6MiAqIHgxO1xyXG5cdHkxID0gejIgKiB4MCAtIHowICogeDI7XHJcblx0eTIgPSB6MCAqIHgxIC0gejEgKiB4MDtcclxuXHJcblx0bGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XHJcblx0aWYgKCFsZW4pIHtcclxuXHRcdHkwID0gMDtcclxuXHRcdHkxID0gMDtcclxuXHRcdHkyID0gMDtcclxuXHR9IGVsc2Uge1xyXG5cdFx0bGVuID0gMSAvIGxlbjtcclxuXHRcdHkwICo9IGxlbjtcclxuXHRcdHkxICo9IGxlbjtcclxuXHRcdHkyICo9IGxlbjtcclxuXHR9XHJcblxyXG5cdG91dFswXSA9IHgwO1xyXG5cdG91dFsxXSA9IHkwO1xyXG5cdG91dFsyXSA9IHowO1xyXG5cdG91dFszXSA9IDA7XHJcblx0b3V0WzRdID0geDE7XHJcblx0b3V0WzVdID0geTE7XHJcblx0b3V0WzZdID0gejE7XHJcblx0b3V0WzddID0gMDtcclxuXHRvdXRbOF0gPSB4MjtcclxuXHRvdXRbOV0gPSB5MjtcclxuXHRvdXRbMTBdID0gejI7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcclxuXHRvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xyXG5cdG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleik7XHJcblx0b3V0WzE1XSA9IDE7XHJcblxyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xyXG5cdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdGxldCB4ID0gcVswXSxcclxuXHRcdHkgPSBxWzFdLFxyXG5cdFx0eiA9IHFbMl0sXHJcblx0XHR3ID0gcVszXTtcclxuXHRsZXQgeDIgPSB4ICsgeDtcclxuXHRsZXQgeTIgPSB5ICsgeTtcclxuXHRsZXQgejIgPSB6ICsgejtcclxuXHRsZXQgeHggPSB4ICogeDI7XHJcblx0bGV0IHh5ID0geCAqIHkyO1xyXG5cdGxldCB4eiA9IHggKiB6MjtcclxuXHRsZXQgeXkgPSB5ICogeTI7XHJcblx0bGV0IHl6ID0geSAqIHoyO1xyXG5cdGxldCB6eiA9IHogKiB6MjtcclxuXHRsZXQgd3ggPSB3ICogeDI7XHJcblx0bGV0IHd5ID0gdyAqIHkyO1xyXG5cdGxldCB3eiA9IHcgKiB6MjtcclxuXHRsZXQgc3ggPSBzWzBdO1xyXG5cdGxldCBzeSA9IHNbMV07XHJcblx0bGV0IHN6ID0gc1syXTtcclxuXHRvdXRbMF0gPSAoMSAtICh5eSArIHp6KSkgKiBzeDtcclxuXHRvdXRbMV0gPSAoeHkgKyB3eikgKiBzeDtcclxuXHRvdXRbMl0gPSAoeHogLSB3eSkgKiBzeDtcclxuXHRvdXRbM10gPSAwO1xyXG5cdG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5O1xyXG5cdG91dFs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xyXG5cdG91dFs2XSA9ICh5eiArIHd4KSAqIHN5O1xyXG5cdG91dFs3XSA9IDA7XHJcblx0b3V0WzhdID0gKHh6ICsgd3kpICogc3o7XHJcblx0b3V0WzldID0gKHl6IC0gd3gpICogc3o7XHJcblx0b3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xyXG5cdG91dFsxMV0gPSAwO1xyXG5cdG91dFsxMl0gPSB2WzBdO1xyXG5cdG91dFsxM10gPSB2WzFdO1xyXG5cdG91dFsxNF0gPSB2WzJdO1xyXG5cdG91dFsxNV0gPSAxO1xyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmcm9tWFJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0bGV0IHMgPSBNYXRoLnNpbihyYWQpO1xyXG5cdGxldCBjID0gTWF0aC5jb3MocmFkKTtcclxuXHQvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblx0b3V0WzBdID0gMTtcclxuXHRvdXRbMV0gPSAwO1xyXG5cdG91dFsyXSA9IDA7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSAwO1xyXG5cdG91dFs1XSA9IGM7XHJcblx0b3V0WzZdID0gcztcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IDA7XHJcblx0b3V0WzldID0gLXM7XHJcblx0b3V0WzEwXSA9IGM7XHJcblx0b3V0WzExXSA9IDA7XHJcblx0b3V0WzEyXSA9IDA7XHJcblx0b3V0WzEzXSA9IDA7XHJcblx0b3V0WzE0XSA9IDA7XHJcblx0b3V0WzE1XSA9IDE7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRhcmdldFRvKG91dCwgZXllLCB0YXJnZXQsIHVwKSB7XHJcblx0bGV0IGV5ZXggPSBleWVbMF0sXHJcblx0XHRleWV5ID0gZXllWzFdLFxyXG5cdFx0ZXlleiA9IGV5ZVsyXSxcclxuXHRcdHVweCA9IHVwWzBdLFxyXG5cdFx0dXB5ID0gdXBbMV0sXHJcblx0XHR1cHogPSB1cFsyXTtcclxuXHRsZXQgejAgPSBleWV4IC0gdGFyZ2V0WzBdLFxyXG5cdFx0ejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxyXG5cdFx0ejIgPSBleWV6IC0gdGFyZ2V0WzJdO1xyXG5cdGxldCBsZW4gPSB6MCAqIHowICsgejEgKiB6MSArIHoyICogejI7XHJcblx0aWYgKGxlbiA+IDApIHtcclxuXHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuXHRcdHowICo9IGxlbjtcclxuXHRcdHoxICo9IGxlbjtcclxuXHRcdHoyICo9IGxlbjtcclxuXHR9XHJcblx0bGV0IHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcclxuXHRcdHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcclxuXHRcdHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcclxuXHRsZW4gPSB4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDI7XHJcblx0aWYgKGxlbiA+IDApIHtcclxuXHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuXHRcdHgwICo9IGxlbjtcclxuXHRcdHgxICo9IGxlbjtcclxuXHRcdHgyICo9IGxlbjtcclxuXHR9XHJcblx0b3V0WzBdID0geDA7XHJcblx0b3V0WzFdID0geDE7XHJcblx0b3V0WzJdID0geDI7XHJcblx0b3V0WzNdID0gMDtcclxuXHRvdXRbNF0gPSB6MSAqIHgyIC0gejIgKiB4MTtcclxuXHRvdXRbNV0gPSB6MiAqIHgwIC0gejAgKiB4MjtcclxuXHRvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MDtcclxuXHRvdXRbN10gPSAwO1xyXG5cdG91dFs4XSA9IHowO1xyXG5cdG91dFs5XSA9IHoxO1xyXG5cdG91dFsxMF0gPSB6MjtcclxuXHRvdXRbMTFdID0gMDtcclxuXHRvdXRbMTJdID0gZXlleDtcclxuXHRvdXRbMTNdID0gZXlleTtcclxuXHRvdXRbMTRdID0gZXllejtcclxuXHRvdXRbMTVdID0gMTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xyXG5cdC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcclxuXHRpZiAob3V0ID09PSBhKSB7XHJcblx0XHRsZXQgYTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTAzID0gYVszXTtcclxuXHRcdGxldCBhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddO1xyXG5cdFx0bGV0IGEyMyA9IGFbMTFdO1xyXG5cclxuXHRcdG91dFsxXSA9IGFbNF07XHJcblx0XHRvdXRbMl0gPSBhWzhdO1xyXG5cdFx0b3V0WzNdID0gYVsxMl07XHJcblx0XHRvdXRbNF0gPSBhMDE7XHJcblx0XHRvdXRbNl0gPSBhWzldO1xyXG5cdFx0b3V0WzddID0gYVsxM107XHJcblx0XHRvdXRbOF0gPSBhMDI7XHJcblx0XHRvdXRbOV0gPSBhMTI7XHJcblx0XHRvdXRbMTFdID0gYVsxNF07XHJcblx0XHRvdXRbMTJdID0gYTAzO1xyXG5cdFx0b3V0WzEzXSA9IGExMztcclxuXHRcdG91dFsxNF0gPSBhMjM7XHJcblx0fSBlbHNlIHtcclxuXHRcdG91dFswXSA9IGFbMF07XHJcblx0XHRvdXRbMV0gPSBhWzRdO1xyXG5cdFx0b3V0WzJdID0gYVs4XTtcclxuXHRcdG91dFszXSA9IGFbMTJdO1xyXG5cdFx0b3V0WzRdID0gYVsxXTtcclxuXHRcdG91dFs1XSA9IGFbNV07XHJcblx0XHRvdXRbNl0gPSBhWzldO1xyXG5cdFx0b3V0WzddID0gYVsxM107XHJcblx0XHRvdXRbOF0gPSBhWzJdO1xyXG5cdFx0b3V0WzldID0gYVs2XTtcclxuXHRcdG91dFsxMF0gPSBhWzEwXTtcclxuXHRcdG91dFsxMV0gPSBhWzE0XTtcclxuXHRcdG91dFsxMl0gPSBhWzNdO1xyXG5cdFx0b3V0WzEzXSA9IGFbN107XHJcblx0XHRvdXRbMTRdID0gYVsxMV07XHJcblx0XHRvdXRbMTVdID0gYVsxNV07XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vKipcclxuICogSW52ZXJ0cyBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XHJcblx0bGV0IGEwMCA9IGFbMF0sXHJcblx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0YTAyID0gYVsyXSxcclxuXHRcdGEwMyA9IGFbM107XHJcblx0bGV0IGExMCA9IGFbNF0sXHJcblx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0YTEyID0gYVs2XSxcclxuXHRcdGExMyA9IGFbN107XHJcblx0bGV0IGEyMCA9IGFbOF0sXHJcblx0XHRhMjEgPSBhWzldLFxyXG5cdFx0YTIyID0gYVsxMF0sXHJcblx0XHRhMjMgPSBhWzExXTtcclxuXHRsZXQgYTMwID0gYVsxMl0sXHJcblx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdGEzMiA9IGFbMTRdLFxyXG5cdFx0YTMzID0gYVsxNV07XHJcblxyXG5cdGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XHJcblx0bGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcclxuXHRsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xyXG5cdGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XHJcblx0bGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcclxuXHRsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xyXG5cdGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XHJcblx0bGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcclxuXHRsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xyXG5cdGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XHJcblx0bGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcclxuXHRsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xyXG5cclxuXHQvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblx0bGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcclxuXHJcblx0aWYgKCFkZXQpIHtcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRkZXQgPSAxLjAgLyBkZXQ7XHJcblxyXG5cdG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xyXG5cdG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xyXG5cdG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xyXG5cdG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xyXG5cdG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xyXG5cdG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xyXG5cdG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xyXG5cdG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xyXG5cdG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xyXG5cdG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xyXG5cdG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcclxuXHRvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XHJcblx0b3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xyXG5cdG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcclxuXHRvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XHJcblx0b3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xyXG5cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gJy4vY29tbW9uJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0bGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xyXG5cdGlmIChnbE1hdHJpeC5BUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0b3V0WzBdID0gMDtcclxuXHRcdG91dFsxXSA9IDA7XHJcblx0XHRvdXRbMl0gPSAwO1xyXG5cdH1cclxuXHRvdXRbM10gPSAxO1xyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuICogQHJldHVybnMge3F1YXR9IG91dFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcclxuXHRyYWQgKj0gMC41O1xyXG5cdGxldCBheCA9IGFbMF0sXHJcblx0XHRheSA9IGFbMV0sXHJcblx0XHRheiA9IGFbMl0sXHJcblx0XHRhdyA9IGFbM107XHJcblx0bGV0IGJ4ID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdGJ3ID0gTWF0aC5jb3MocmFkKTtcclxuXHRvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcclxuXHRvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcclxuXHRvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcclxuXHRvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gJy4vY29tbW9uJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0bGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xyXG5cdGlmIChnbE1hdHJpeC5BUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0b3V0WzBdID0gMDtcclxuXHRcdG91dFsxXSA9IDA7XHJcblx0XHRvdXRbMl0gPSAwO1xyXG5cdH1cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xyXG5cdG91dFswXSA9IGFbMF0gKyBiWzBdO1xyXG5cdG91dFsxXSA9IGFbMV0gKyBiWzFdO1xyXG5cdG91dFsyXSA9IGFbMl0gKyBiWzJdO1xyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgYiwgYykge1xyXG5cdGxldCBwID0gW10sXHJcblx0XHRyID0gW107XHJcblx0Ly9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG5cdHBbMF0gPSBhWzBdIC0gYlswXTtcclxuXHRwWzFdID0gYVsxXSAtIGJbMV07XHJcblx0cFsyXSA9IGFbMl0gLSBiWzJdO1xyXG5cdC8vcGVyZm9ybSByb3RhdGlvblxyXG5cdHJbMF0gPSBwWzBdICogTWF0aC5jb3MoYykgLSBwWzFdICogTWF0aC5zaW4oYyk7XHJcblx0clsxXSA9IHBbMF0gKiBNYXRoLnNpbihjKSArIHBbMV0gKiBNYXRoLmNvcyhjKTtcclxuXHRyWzJdID0gcFsyXTtcclxuXHQvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcblx0b3V0WzBdID0gclswXSArIGJbMF07XHJcblx0b3V0WzFdID0gclsxXSArIGJbMV07XHJcblx0b3V0WzJdID0gclsyXSArIGJbMl07XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCBiLCBjKSB7XHJcblx0bGV0IHAgPSBbXSxcclxuXHRcdHIgPSBbXTtcclxuXHQvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcblx0cFswXSA9IGFbMF0gLSBiWzBdO1xyXG5cdHBbMV0gPSBhWzFdIC0gYlsxXTtcclxuXHRwWzJdID0gYVsyXSAtIGJbMl07XHJcblx0Ly9wZXJmb3JtIHJvdGF0aW9uXHJcblx0clswXSA9IHBbMl0gKiBNYXRoLnNpbihjKSArIHBbMF0gKiBNYXRoLmNvcyhjKTtcclxuXHRyWzFdID0gcFsxXTtcclxuXHRyWzJdID0gcFsyXSAqIE1hdGguY29zKGMpIC0gcFswXSAqIE1hdGguc2luKGMpO1xyXG5cdC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuXHRvdXRbMF0gPSByWzBdICsgYlswXTtcclxuXHRvdXRbMV0gPSByWzFdICsgYlsxXTtcclxuXHRvdXRbMl0gPSByWzJdICsgYlsyXTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcclxuXHRsZXQgeCA9IGFbMF0sXHJcblx0XHR5ID0gYVsxXSxcclxuXHRcdHogPSBhWzJdO1xyXG5cdGxldCB3ID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdO1xyXG5cdHcgPSB3IHx8IDEuMDtcclxuXHRvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gdztcclxuXHRvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10pIC8gdztcclxuXHRvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdKSAvIHc7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XHJcblx0bGV0IHggPSBhWzBdO1xyXG5cdGxldCB5ID0gYVsxXTtcclxuXHRsZXQgeiA9IGFbMl07XHJcblx0bGV0IGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogejtcclxuXHRpZiAobGVuID4gMCkge1xyXG5cdFx0Ly9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cclxuXHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBsZW47XHJcblx0XHRvdXRbMV0gPSBhWzFdICogbGVuO1xyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGxlbjtcclxuXHR9XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcclxuXHRsZXQgYXggPSBhWzBdLFxyXG5cdFx0YXkgPSBhWzFdLFxyXG5cdFx0YXogPSBhWzJdO1xyXG5cdGxldCBieCA9IGJbMF0sXHJcblx0XHRieSA9IGJbMV0sXHJcblx0XHRieiA9IGJbMl07XHJcblx0b3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XHJcblx0b3V0WzFdID0gYXogKiBieCAtIGF4ICogYno7XHJcblx0b3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG4iLCJleHBvcnQgZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XHJcblx0cmV0dXJuIE1hdGgubWluKE1hdGgubWF4KHZhbHVlLCBtaW4pLCBtYXgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2UobWluLCBtYXgpIHtcclxuXHRyZXR1cm4gKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpICsgbWluO1xyXG59XHJcblxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMjg2MTgwNC9ob3ctdG8tY2FsY3VsYXRlLXRoZS1jZW50cmUtcG9pbnQtb2YtYS1jaXJjbGUtZ2l2ZW4tdGhyZWUtcG9pbnRzXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVDaXJjbGVDZW50ZXIoQSwgQiwgQykge1xyXG5cdHZhciB5RGVsdGFfYSA9IEIueSAtIEEueTtcclxuXHR2YXIgeERlbHRhX2EgPSBCLnggLSBBLng7XHJcblx0dmFyIHlEZWx0YV9iID0gQy55IC0gQi55O1xyXG5cdHZhciB4RGVsdGFfYiA9IEMueCAtIEIueDtcclxuXHJcblx0bGV0IGNlbnRlciA9IHt9O1xyXG5cclxuXHR2YXIgYVNsb3BlID0geURlbHRhX2EgLyB4RGVsdGFfYTtcclxuXHR2YXIgYlNsb3BlID0geURlbHRhX2IgLyB4RGVsdGFfYjtcclxuXHJcblx0Y2VudGVyLnggPVxyXG5cdFx0KGFTbG9wZSAqIGJTbG9wZSAqIChBLnkgLSBDLnkpICsgYlNsb3BlICogKEEueCArIEIueCkgLSBhU2xvcGUgKiAoQi54ICsgQy54KSkgL1xyXG5cdFx0KDIgKiAoYlNsb3BlIC0gYVNsb3BlKSk7XHJcblx0Y2VudGVyLnkgPSAoLTEgKiAoY2VudGVyLnggLSAoQS54ICsgQi54KSAvIDIpKSAvIGFTbG9wZSArIChBLnkgKyBCLnkpIC8gMjtcclxuXHJcblx0cmV0dXJuIGNlbnRlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIG1peCDigJQgbGluZWFybHkgaW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWl4KHgsIHksIGEpIHtcclxuXHRyZXR1cm4geCAqICgxIC0gYSkgKyB5ICogYTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZ1RvUmFkKHZhbHVlKSB7XHJcblx0Ly8gTWF0aC5QSSAvIDE4MCA9IDAuMDE3NDUzMjkyNTE5OTQzMjk1XHJcblx0cmV0dXJuIHZhbHVlICogMC4wMTc0NTMyOTI1MTk5NDMyOTU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByYWRUb0RlZyh2YWx1ZSkge1xyXG5cdC8vIDE4MCAvIE1hdGguUEkgPSA1Ny4yOTU3Nzk1MTMwODIzMlxyXG5cdHJldHVybiA1Ny4yOTU3Nzk1MTMwODIzMiAqIHZhbHVlO1xyXG59XHJcbiIsIi8vIGJhc2VkIG9uIGdsLW1hdHJpeFxyXG4vLyBleHRyYWN0IG1ldGhvZCB3aGljaCBpcyBvbmx5IHVzZWRcclxuXHJcbmltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gJy4vZ2wtbWF0cml4L2NvbW1vbic7XHJcbmltcG9ydCAqIGFzIG1hdDQgZnJvbSAnLi9nbC1tYXRyaXgvbWF0NCc7XHJcbmltcG9ydCAqIGFzIHF1YXQgZnJvbSAnLi9nbC1tYXRyaXgvcXVhdCc7XHJcbmltcG9ydCAqIGFzIHZlYzMgZnJvbSAnLi9nbC1tYXRyaXgvdmVjMyc7XHJcbmltcG9ydCAqIGFzIG1hdGggZnJvbSAnLi9tYXRoJztcclxuXHJcbmV4cG9ydCB7IGdsTWF0cml4LCBtYXQ0LCBxdWF0LCB2ZWMzLCBtYXRoIH07XHJcbiIsImltcG9ydCB7IG1hdDQgfSBmcm9tICcuLi9tYXRoJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDYW1lcmEge1xyXG5cdGNvbnN0cnVjdG9yKHR5cGUgPSAnY2FtZXJhJykge1xyXG5cdFx0dGhpcy50eXBlID0gdHlwZTtcclxuXHRcdHRoaXMucG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuXHRcdHRoaXMubG9va0F0UG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuXHJcblx0XHR0aGlzLnZpZXdNYXRyaXggPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cdFx0dGhpcy5wcm9qZWN0aW9uTWF0cml4ID0gbWF0NC5jcmVhdGUoKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVBvc2l0aW9uKHh4ID0gMCwgeXkgPSAwLCB6eiA9IDApIHtcclxuXHRcdHRoaXMucG9zaXRpb24ueCA9IHh4O1xyXG5cdFx0dGhpcy5wb3NpdGlvbi55ID0geXk7XHJcblx0XHR0aGlzLnBvc2l0aW9uLnogPSB6ejtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZUxvb2tBdFBvc2l0aW9uKHh4ID0gMCwgeXkgPSAwLCB6eiA9IC0xMDApIHtcclxuXHRcdHRoaXMubG9va0F0UG9zaXRpb24ueCA9IHh4O1xyXG5cdFx0dGhpcy5sb29rQXRQb3NpdGlvbi55ID0geXk7XHJcblx0XHR0aGlzLmxvb2tBdFBvc2l0aW9uLnogPSB6ejtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVZpZXdNYXRyaXgoKSB7XHJcblx0XHRtYXQ0Lmxvb2tBdChcclxuXHRcdFx0dGhpcy52aWV3TWF0cml4LFxyXG5cdFx0XHRbdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMucG9zaXRpb24uel0sXHJcblx0XHRcdFt0aGlzLmxvb2tBdFBvc2l0aW9uLngsIHRoaXMubG9va0F0UG9zaXRpb24ueSwgdGhpcy5sb29rQXRQb3NpdGlvbi56XSxcclxuXHRcdFx0WzAsIDEsIDBdXHJcblx0XHQpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBlcnNwZWN0aXZlQ2FtZXJhIGV4dGVuZHMgQ2FtZXJhIHtcclxuXHRjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0LCBmb3YgPSA0NSwgbmVhciA9IDAuMSwgZmFyID0gMTAwMCkge1xyXG5cdFx0c3VwZXIoJ3BlcnNwZWN0aXZlJyk7XHJcblx0XHR0aGlzLnVwZGF0ZVBlcnNwZWN0aXZlKHdpZHRoLCBoZWlnaHQsIGZvdiwgbmVhciwgZmFyKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVBlcnNwZWN0aXZlKHdpZHRoLCBoZWlnaHQsIGZvdiwgbmVhciwgZmFyKSB7XHJcblx0XHRtYXQ0LnBlcnNwZWN0aXZlKHRoaXMucHJvamVjdGlvbk1hdHJpeCwgKGZvdiAvIDE4MCkgKiBNYXRoLlBJLCB3aWR0aCAvIGhlaWdodCwgbmVhciwgZmFyKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBPcnRob0NhbWVyYSBleHRlbmRzIENhbWVyYSB7XHJcblx0Y29uc3RydWN0b3IobGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcclxuXHRcdHN1cGVyKCdvcnRobycpO1xyXG5cdFx0dGhpcy51cGRhdGVQZXJzcGVjdGl2ZShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcik7XHJcblx0fVxyXG5cclxuXHR1cGRhdGVQZXJzcGVjdGl2ZShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xyXG5cdFx0bWF0NC5vcnRobyh0aGlzLnByb2plY3Rpb25NYXRyaXgsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKTtcclxuXHR9XHJcbn1cclxuIiwiY29uc29sZS5sb2coJ1tkYW5zaGFyaUdMXSB2ZXJzaW9uOiBEQU5TSEFSSV9WRVJTT0lOLCAlbycsICdodHRwczovL2dpdGh1Yi5jb20va2VuamlTcGVjaWFsL3R1YnVnbCcpO1xyXG5cclxuZXhwb3J0ICogZnJvbSAnLi91dGlscy9mdW5jdGlvbnMvZ2wtZnVuY3Rpb25zJztcclxuZXhwb3J0ICogZnJvbSAnLi91dGlscy9mdW5jdGlvbnMvZ2wtdGV4dHVyZXMnO1xyXG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL2Z1bmN0aW9ucy9hc3NldHMtZnVuY3Rpb25zJztcclxuXHJcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMvZ2VuZXJhdGUvZ2VuZXJhdGUtZ2VvbWV0cnknO1xyXG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL2dlbmVyYXRlL2dlbmVyYXRlLXNpbXBsZS1nZW9tZXRyeSc7XHJcblxyXG5leHBvcnQgKiBmcm9tICcuL2NhbWVyYSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XHJcbiJdLCJuYW1lcyI6WyJGTE9BVCIsIlJHQiIsIkNMQU1QX1RPX0VER0UiLCJnZXRVbmlmb3JtTG9jYXRpb25zIiwiZ2wiLCJwcm9ncmFtIiwiYXJyIiwibG9jYXRpb25zIiwiaWkiLCJsZW5ndGgiLCJuYW1lIiwidW5pZm9ybUxvY2F0aW9uIiwiZ2V0VW5pZm9ybUxvY2F0aW9uIiwiYWRkTGluZU51bWJlcnMiLCJzdHJpbmciLCJsaW5lcyIsInNwbGl0IiwiaSIsImpvaW4iLCJjb21waWxlR0xTaGFkZXIiLCJ0eXBlIiwic2hhZGVyU291cmNlIiwic2hhZGVyIiwiY3JlYXRlU2hhZGVyIiwiY29tcGlsZVNoYWRlciIsImdldFNoYWRlclBhcmFtZXRlciIsIkNPTVBJTEVfU1RBVFVTIiwiY29uc29sZSIsImVycm9yIiwiZ2V0U2hhZGVySW5mb0xvZyIsIndhcm4iLCJWRVJURVhfU0hBREVSIiwiY3JlYXRlUHJnb3JhbSIsInZlcnRleFNoYWRlclNyYyIsImZyYWdtZW50U2hhZGVyU3JjIiwiY3JlYXRlUHJvZ3JhbSIsInZlcnRleFNoYWRlciIsImZyYWdtZW50U2hhZGVyIiwiRlJBR01FTlRfU0hBREVSIiwiYXR0YWNoU2hhZGVyIiwibGlua1Byb2dyYW0iLCJzdWNjZXNzIiwiZ2V0UHJvZ3JhbVBhcmFtZXRlciIsIkxJTktfU1RBVFVTIiwiZ2V0UHJvZ3JhbUluZm9Mb2ciLCJjcmVhdGVCdWZmZXIiLCJkYXRhIiwic3RyIiwiYnVmZmVyIiwibG9jYXRpb24iLCJnZXRBdHRyaWJMb2NhdGlvbiIsImJpbmRCdWZmZXIiLCJBUlJBWV9CVUZGRVIiLCJidWZmZXJEYXRhIiwiU1RBVElDX0RSQVciLCJjcmVhdGVJbmRleCIsImluZGljZXMiLCJFTEVNRU5UX0FSUkFZX0JVRkZFUiIsImNudCIsInNpemUiLCJub3JtYWxpemVkIiwic3RyaWRlIiwib2Zmc2V0IiwidmVydGV4QXR0cmliUG9pbnRlciIsImVuYWJsZVZlcnRleEF0dHJpYkFycmF5IiwiY3JlYXRlRW1wdHlUZXh0dXJlIiwidGV4dHVyZVdpZHRoIiwidGV4dHVyZUhlaWdodCIsImZvcm1hdCIsIm1pbkZpbHRlciIsIkxJTkVBUiIsIm1hZ0ZpbHRlciIsIndyYXBTIiwid3JhcFQiLCJ0YXJnZXRUZXh0dXJlIiwiY3JlYXRlVGV4dHVyZSIsImJpbmRUZXh0dXJlIiwiVEVYVFVSRV8yRCIsInRleEltYWdlMkQiLCJERVBUSF9DT01QT05FTlQiLCJVTlNJR05FRF9TSE9SVCIsImxvZyIsInRleFBhcmFtZXRlcmkiLCJURVhUVVJFX01JTl9GSUxURVIiLCJURVhUVVJFX01BR19GSUxURVIiLCJURVhUVVJFX1dSQVBfUyIsIlRFWFRVUkVfV1JBUF9UIiwiY3JlYXRlSW1hZ2VUZXh0dXJlIiwiaW1hZ2UiLCJpc0ZsaXAiLCJpc01pcG1hcCIsInRleHR1cmUiLCJhY3RpdmVUZXh0dXJlIiwiVEVYVFVSRTAiLCJwaXhlbFN0b3JlaSIsIlVOUEFDS19GTElQX1lfV0VCR0wiLCJVTlNJR05FRF9CWVRFIiwiaXNQb3dlck9mMiIsIndpZHRoIiwiaGVpZ2h0IiwiZ2VuZXJhdGVNaXBtYXAiLCJ1cGRhdGVJbWFnZVRleHR1cmUiLCJ2YWx1ZSIsInRleHR1cmVOdW0iLCJhY3RpdmVUZXh0dXJlTnVtIiwidW5pZm9ybTFpIiwiZ2V0QWpheEpzb24iLCJ1cmwiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwicmVzcCIsInJlc3BvbnNlVGV4dCIsInJlc3BKc29uIiwiSlNPTiIsInBhcnNlIiwic2VuZCIsImdldEltYWdlIiwiaW1hZ2VVcmwiLCJJbWFnZSIsIm9ubG9hZCIsIm9uZXJyb3IiLCJzcmMiLCJnZXRTcGhlcmUiLCJyYWRpdXMiLCJsYXRpdHVkZUJhbmRzIiwibG9uZ2l0dWRlQmFuZHMiLCJ2ZXJ0aWNlcyIsInRleHR1cmVzIiwibm9ybWFscyIsImxhdE51bWJlciIsInRoZXRhIiwiTWF0aCIsIlBJIiwic2luVGhldGEiLCJzaW4iLCJjb3NUaGV0YSIsImNvcyIsImxvbmdOdW1iZXIiLCJwaGkiLCJzaW5QaGkiLCJjb3NQaGkiLCJ4IiwieSIsInoiLCJ1IiwidiIsInB1c2giLCJmaXJzdCIsInNlY29uZCIsInV2cyIsImdldFBsYW5lIiwid2lkdGhTZWdtZW50IiwiaGVpZ2h0U2VnbWVudCIsInhSYXRlIiwieVJhdGUiLCJ5eSIsInlQb3MiLCJ4eCIsInhQb3MiLCJyb3dTdGFydE51bSIsIm5leHRSb3dTdGFydE51bSIsIm1lcmdlR2VvbXRvcnkiLCJnZW9tZXRyaWVzIiwibGFzdFZlcnRpY2VzIiwiZ2VvbWV0cnkiLCJjcmVhdGVTaW1wbGVCb3giLCJkZXB0aCIsImZibCIsImZiciIsImZ0bCIsImZ0ciIsImJibCIsImJiciIsImJ0bCIsImJ0ciIsInBvc2l0aW9ucyIsIkZsb2F0MzJBcnJheSIsImxheW91dFBvc2l0aW9uIiwiY291bnQiLCJuaSIsInBhcnNlSW50IiwiY3JlYXRlU2ltcGxlUGxhbmUiLCJibCIsImJyIiwidGwiLCJ0ciIsIkVQU0lMT04iLCJBUlJBWV9UWVBFIiwiQXJyYXkiLCJSQU5ET00iLCJyYW5kb20iLCJjcmVhdGUiLCJvdXQiLCJnbE1hdHJpeCIsIm11bHRpcGx5IiwiYSIsImIiLCJhMDAiLCJhMDEiLCJhMDIiLCJhMDMiLCJhMTAiLCJhMTEiLCJhMTIiLCJhMTMiLCJhMjAiLCJhMjEiLCJhMjIiLCJhMjMiLCJhMzAiLCJhMzEiLCJhMzIiLCJhMzMiLCJiMCIsImIxIiwiYjIiLCJiMyIsInBlcnNwZWN0aXZlIiwiZm92eSIsImFzcGVjdCIsIm5lYXIiLCJmYXIiLCJmIiwidGFuIiwibmYiLCJJbmZpbml0eSIsIm9ydGhvIiwibGVmdCIsInJpZ2h0IiwiYm90dG9tIiwidG9wIiwibHIiLCJidCIsImlkZW50aXR5IiwiY2xvbmUiLCJtYXQiLCJmcm9tVHJhbnNsYXRpb24iLCJmcm9tWVJvdGF0aW9uIiwicmFkIiwicyIsImMiLCJsb29rQXQiLCJleWUiLCJjZW50ZXIiLCJ1cCIsIngwIiwieDEiLCJ4MiIsInkwIiwieTEiLCJ5MiIsInowIiwiejEiLCJ6MiIsImxlbiIsImV5ZXgiLCJleWV5IiwiZXlleiIsInVweCIsInVweSIsInVweiIsImNlbnRlcngiLCJjZW50ZXJ5IiwiY2VudGVyeiIsImFicyIsInNxcnQiLCJmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlIiwicSIsInciLCJ4eSIsInh6IiwieXoiLCJ6eiIsInd4Iiwid3kiLCJ3eiIsInN4Iiwic3kiLCJzeiIsImZyb21YUm90YXRpb24iLCJ0YXJnZXRUbyIsInRhcmdldCIsInRyYW5zcG9zZSIsImludmVydCIsImIwMCIsImIwMSIsImIwMiIsImIwMyIsImIwNCIsImIwNSIsImIwNiIsImIwNyIsImIwOCIsImIwOSIsImIxMCIsImIxMSIsImRldCIsInJvdGF0ZVgiLCJheCIsImF5IiwiYXoiLCJhdyIsImJ4IiwiYnciLCJhZGQiLCJyb3RhdGVaIiwicCIsInIiLCJyb3RhdGVZIiwidHJhbnNmb3JtTWF0NCIsIm0iLCJub3JtYWxpemUiLCJjcm9zcyIsImJ5IiwiYnoiLCJjbGFtcCIsIm1pbiIsIm1heCIsInJhbmdlIiwiY2FsY3VsYXRlQ2lyY2xlQ2VudGVyIiwiQSIsIkIiLCJDIiwieURlbHRhX2EiLCJ4RGVsdGFfYSIsInlEZWx0YV9iIiwieERlbHRhX2IiLCJhU2xvcGUiLCJiU2xvcGUiLCJtaXgiLCJkZWdUb1JhZCIsInJhZFRvRGVnIiwiQ2FtZXJhIiwicG9zaXRpb24iLCJsb29rQXRQb3NpdGlvbiIsInZpZXdNYXRyaXgiLCJtYXQ0IiwicHJvamVjdGlvbk1hdHJpeCIsIlBlcnNwZWN0aXZlQ2FtZXJhIiwiZm92IiwidXBkYXRlUGVyc3BlY3RpdmUiLCJPcnRob0NhbWVyYSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0NBQU8sSUFBTUEsUUFBUSxNQUFkOztBQUVQLENBQU8sSUFBTUMsTUFBTSxNQUFaO0NBU0EsSUFBTUMsZ0JBQWdCLE1BQXRCOztDQ1RQOzs7Ozs7Ozs7QUFTQSxDQUFPLFNBQVNDLG1CQUFULENBQTZCQyxFQUE3QixFQUFpQ0MsT0FBakMsRUFBMENDLEdBQTFDLEVBQStDO0NBQ3JELEtBQUlDLFlBQVksRUFBaEI7O0NBRUEsTUFBSyxJQUFJQyxLQUFLLENBQWQsRUFBaUJBLEtBQUtGLElBQUlHLE1BQTFCLEVBQWtDRCxJQUFsQyxFQUF3QztDQUN2QyxNQUFJRSxPQUFPSixJQUFJRSxFQUFKLENBQVg7Q0FDQSxNQUFJRyxrQkFBa0JQLEdBQUdRLGtCQUFILENBQXNCUCxPQUF0QixFQUErQkssSUFBL0IsQ0FBdEI7Q0FDQUgsWUFBVUcsSUFBVixJQUFrQkMsZUFBbEI7Q0FDQTs7Q0FFRCxRQUFPSixTQUFQO0NBQ0E7O0NBRUQ7Ozs7QUFJQSxDQUFPLFNBQVNNLGNBQVQsQ0FBd0JDLE1BQXhCLEVBQWdDO0NBQ3RDLEtBQUlDLFFBQVFELE9BQU9FLEtBQVAsQ0FBYSxJQUFiLENBQVo7O0NBRUEsTUFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLE1BQU1O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
