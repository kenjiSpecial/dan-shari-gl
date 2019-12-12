var FLOAT = 0x1406;
var RGB = 0x1907;
// variables relating to textures
var NEAREST = 0x2600;
var LINEAR = 0x2601;
var NEAREST_MIPMAP_NEAREST = 0x2700;
var LINEAR_MIPMAP_NEAREST = 0x2701;
var NEAREST_MIPMAP_LINEAR = 0x2702;
var LINEAR_MIPMAP_LINEAR = 0x2703;
var CLAMP_TO_EDGE = 0x812f;
var REPEAT = 0x2901;
// Framebuffers and renderbuffers
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants#Framebuffers_and_renderbuffers
var DEPTH_COMPONENT16 = 0x81a5;
// Data types
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants#Data_types
var UNSIGNED_BYTE = 0x1401;
var EMPTY_CANVAS_SIZE = 16;
var EMPTY_CANVAS_COLOR = '#ff0000';
var COLOR_REPEAT = 4;
var UNIFORM_1F = '1f';
var UNIFORM_1I = '1i';
var UNIFORM_2F = '2f';
var UNIFORM_3F = '3f';
var UNIFORM_MAT_4F = 'mat4';

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var degree = Math.PI / 180;

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */

function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}

/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */

function create$1() {
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
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

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
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

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
 */

function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
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
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */

function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
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

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$2() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
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
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
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
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */

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
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */

function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create$2();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

function getUniformLocations(gl, program, arr) {
    var locations = {};
    // for (let ii = 0; ii < arr.length; ii++) {
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var name_1 = arr_1[_i];
        var uniformLocation = gl.getUniformLocation(program, name_1);
        locations[name_1] = uniformLocation;
    }
    return locations;
}
/**
 * display error of shader.
 * @param text
 */
function addLineNumbers(text) {
    var lines = text.split('\n');
    for (var ii = 0; ii < lines.length; ii = ii + 1) {
        lines[ii] = ii + 1 + ": " + lines[ii];
    }
    return lines.join('\n');
}
/**
 * compile webgl shader
 * @param gl
 * @param glType
 * @param shaderSource
 */
function compileGLShader(gl, glType, shaderSource) {
    var shader = gl.createShader(glType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    else {
        console.warn("[WebGLShader]: Shader couldn't compile.1");
        if (gl.getShaderInfoLog(shader) !== '') {
            console.warn('[WebGLShader]: gl.getShaderInfoLog()', glType === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog(shader), addLineNumbers(shaderSource));
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
function createProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
    var program = gl.createProgram();
    var vertexShader = compileGLShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    var fragmentShader = compileGLShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    try {
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            throw gl.getProgramInfoLog(program);
        }
    }
    catch (error) {
        console.warn("WebGLProgram: " + error);
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
function createBufferWithLocation(gl, program, data, str) {
    var buffer = gl.createBuffer();
    var location = gl.getAttribLocation(program, str);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buffer: buffer, location: location };
}
/**
 * creates and initializes WebGLBuffer with data
 *
 * @param gl
 * @param data
 */
function createBuffer(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}
/**
 * update array buffer
 *
 * @param gl
 * @param buffer
 * @param data
 * @param isBind
 */
function updateArrayBuffer(gl, buffer, data, isBind) {
    if (isBind === void 0) { isBind = true; }
    if (isBind) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    }
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}
/**
 *
 * make  index buffer
 *
 * @param gl
 * @param indices
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
function bindBuffer(gl, buffer, location, size, type, normalized, stride, offset, isBind) {
    if (location === void 0) { location = 0; }
    if (size === void 0) { size = 1; }
    if (type === void 0) { type = FLOAT; }
    if (normalized === void 0) { normalized = false; }
    if (stride === void 0) { stride = 0; }
    if (offset === void 0) { offset = 0; }
    if (isBind === void 0) { isBind = true; }
    if (isBind) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    }
    gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
    gl.enableVertexAttribArray(location);
}
function generateFaceFromIndex(vertices, indices) {
    var faces = [];
    for (var ii = 0; ii < indices.length; ii = ii + 3) {
        var index0 = indices[ii];
        var index1 = indices[ii + 1];
        var index2 = indices[ii + 2];
        faces.push([
            fromValues(vertices[3 * index0], vertices[3 * index0 + 1], vertices[3 * index0 + 2]),
            fromValues(vertices[3 * index1], vertices[3 * index1 + 1], vertices[3 * index1 + 2]),
            fromValues(vertices[3 * index2], vertices[3 * index2 + 1], vertices[3 * index2 + 2])
        ]);
    }
    return faces;
}
function castMouse(mouse, viewMatrixInverse, projectionMatrixInverse, depth) {
    if (depth === void 0) { depth = 0; }
    var clipSpace = fromValues(mouse[0], mouse[1], depth);
    var cameraSpace = create$2();
    var worldSpace = create$2();
    transformMat4(cameraSpace, clipSpace, projectionMatrixInverse);
    transformMat4(worldSpace, cameraSpace, viewMatrixInverse);
    return worldSpace;
}
function createFrameBufferWithTexture(gl, texture) {
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return framebuffer;
}
function createAndBindDepthBuffer(gl, width, height) {
    var depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    return depth;
}
function addKeyword(sources, keywords) {
    if (keywords === null) {
        return sources;
    }
    return keywords + sources;
}

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
function createEmptyTexture(gl, textureWidth, textureHeight, format, minFilter, magFilter, wrapS, wrapT, type) {
    if (format === void 0) { format = RGB; }
    if (minFilter === void 0) { minFilter = LINEAR; }
    if (magFilter === void 0) { magFilter = LINEAR; }
    if (wrapS === void 0) { wrapS = CLAMP_TO_EDGE; }
    if (wrapT === void 0) { wrapT = CLAMP_TO_EDGE; }
    if (type === void 0) { type = UNSIGNED_BYTE; }
    var texture = gl.createTexture();
    updateEmptyImageTexture(gl, texture, textureWidth, textureHeight, format, minFilter, magFilter, wrapS, wrapT, type);
    return texture;
}
function createImageTexture(gl, canvasImage, format, isFlip, isMipmap) {
    if (format === void 0) { format = RGB; }
    if (isFlip === void 0) { isFlip = false; }
    if (isMipmap === void 0) { isMipmap = false; }
    return createCustomTypeImageTexture(gl, canvasImage, format, gl.UNSIGNED_BYTE, isFlip, isMipmap);
}
function createCustomTypeImageTexture(gl, canvasImage, format, type, isFlip, isMipmap) {
    if (format === void 0) { format = RGB; }
    if (isFlip === void 0) { isFlip = false; }
    if (isMipmap === void 0) { isMipmap = false; }
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isFlip ? 0 : 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, canvasImage);
    if (isPowerOf2(canvasImage.width) && isPowerOf2(canvasImage.height) && isMipmap) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return texture;
}
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}
/**
 *
 * @param gl
 * @param texture
 * @param image
 * @param format
 */
function updateImageTexture(gl, texture, image, format) {
    if (format === void 0) { format = RGB; }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}
function updateEmptyImageTexture(gl, texture, textureWidth, textureHeight, format, minFilter, magFilter, wrapS, wrapT, type) {
    if (format === void 0) { format = RGB; }
    if (minFilter === void 0) { minFilter = LINEAR; }
    if (magFilter === void 0) { magFilter = LINEAR; }
    if (wrapS === void 0) { wrapS = CLAMP_TO_EDGE; }
    if (wrapT === void 0) { wrapT = CLAMP_TO_EDGE; }
    if (type === void 0) { type = UNSIGNED_BYTE; }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // define size and format of level 0
    var level = 0;
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    gl.texImage2D(gl.TEXTURE_2D, level, format, textureWidth, textureHeight, 0, format, type, null);
    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    return texture;
}
/**
 *
 * @param gl
 * @param texture
 * @param uniformLocation
 * @param textureNum
 */
function activeTexture(gl, texture, uniformLocation, textureNum) {
    if (textureNum === void 0) { textureNum = 0; }
    var activeTextureNum = gl.TEXTURE0 + textureNum;
    gl.activeTexture(activeTextureNum);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniformLocation, textureNum);
}

/**
 * load json with ajax
 *
 * @param url url to load json file
 */
function getAjaxJson(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var resp = xhr.responseText;
                var respJson = JSON.parse(resp);
                callback(respJson);
                // resolve(respJson);
            }
        }
    };
    xhr.send();
}
/**
 *
 * @param imageUrl
 */
function getImage(imageUrl, callback) {
    var image = new Image();
    image.onload = function () {
        callback(image);
    };
    image.onerror = function () {
        console.warn("image(" + imageUrl + ") load err");
    };
    image.src = imageUrl;
}
/**
 *
 * @param dracoUrl
 * @param callback
 *
 * https://github.com/kioku-systemk/dracoSample/blob/5611528416d4e0afb10cbec52d70493602d8a552/dracoloader.js#L210
 *
 */
function loadDraco(dracoUrl, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                callback(xhr.response);
            }
            else {
                console.error("Couldn't load [" + dracoUrl + '] [' + xhr.status + ']');
            }
        }
    };
    xhr.open('GET', dracoUrl, true);
    xhr.send(null);
}

function getSphere(radius, latitudeBands, longitudeBands) {
    if (radius === void 0) { radius = 2; }
    if (latitudeBands === void 0) { latitudeBands = 64; }
    if (longitudeBands === void 0) { longitudeBands = 64; }
    var vertices = [];
    var textures = [];
    var normals = [];
    var indices = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber = latNumber + 1) {
        var theta = (latNumber * Math.PI) / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber = longNumber + 1) {
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
    for (var latNumber = 0; latNumber < latitudeBands; latNumber = latNumber + 1) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber = longNumber + 1) {
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
    var uvs = [];
    var xRate = 1 / widthSegment;
    var yRate = 1 / heightSegment;
    // set vertices and barycentric vertices
    for (var yy = 0; yy <= heightSegment; yy++) {
        var yPos = (-0.5 + yRate * yy) * height;
        for (var xx = 0; xx <= widthSegment; xx++) {
            var xPos = (-0.5 + xRate * xx) * width;
            vertices.push(xPos);
            vertices.push(yPos);
            uvs.push(xx / widthSegment);
            uvs.push(yy / heightSegment);
        }
    }
    var indices = [];
    for (var yy = 0; yy < heightSegment; yy++) {
        for (var xx = 0; xx < widthSegment; xx++) {
            var rowStartNum = yy * (widthSegment + 1);
            var nextRowStartNum = (yy + 1) * (widthSegment + 1);
            indices.push(rowStartNum + xx);
            indices.push(rowStartNum + xx + 1);
            indices.push(nextRowStartNum + xx);
            indices.push(rowStartNum + xx + 1);
            indices.push(nextRowStartNum + xx + 1);
            indices.push(nextRowStartNum + xx);
        }
    }
    return {
        vertices: vertices,
        uvs: uvs,
        indices: indices
    };
}
function mergeGeomtory(geometries) {
    var vertices = [];
    var normals = [];
    var uvs = [];
    var indices = [];
    var lastVertices = 0;
    for (var ii = 0; ii < geometries.length; ii++) {
        var geometry = geometries[ii];
        if (geometry.indices.length > 0) {
            for (var ii_1 = 0; ii_1 < geometry.indices.length; ii_1++) {
                indices.push(geometry.indices[ii_1] + lastVertices / 3);
            }
        }
        if (geometry.vertices.length > 0) {
            for (var ii_2 = 0; ii_2 < geometry.vertices.length; ii_2++) {
                vertices.push(geometry.vertices[ii_2]);
            }
            lastVertices += geometry.vertices.length;
        }
        if (geometry.normals.length > 0) {
            for (var ii_3 = 0; ii_3 < geometry.normals.length; ii_3++) {
                normals.push(geometry.normals[ii_3]);
            }
        }
        if (geometry.uvs.length > 0) {
            for (var ii_4 = 0; ii_4 < geometry.uvs.length; ii_4++) {
                uvs.push(geometry.uvs[ii_4]);
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
function createSimpleBox() {
    var unit = 0.5;
    var positions = [
        // Front face
        -unit,
        -unit,
        unit,
        unit,
        -unit,
        unit,
        unit,
        unit,
        unit,
        -unit,
        unit,
        unit,
        // Back face
        -unit,
        -unit,
        -unit,
        -unit,
        unit,
        -unit,
        unit,
        unit,
        -unit,
        unit,
        -unit,
        -unit,
        // Top face
        -unit,
        unit,
        -unit,
        -unit,
        unit,
        unit,
        unit,
        unit,
        unit,
        unit,
        unit,
        -unit,
        // Bottom face
        -unit,
        -unit,
        -unit,
        unit,
        -unit,
        -unit,
        unit,
        -unit,
        unit,
        -unit,
        -unit,
        unit,
        // Right face
        unit,
        -unit,
        -unit,
        unit,
        unit,
        -unit,
        unit,
        unit,
        unit,
        unit,
        -unit,
        unit,
        // Left face
        -unit,
        -unit,
        -unit,
        -unit,
        -unit,
        unit,
        -unit,
        unit,
        unit,
        -unit,
        unit,
        -unit
    ];
    var indices = [
        0,
        1,
        2,
        0,
        2,
        3,
        4,
        5,
        6,
        4,
        6,
        7,
        8,
        9,
        10,
        8,
        10,
        11,
        12,
        13,
        14,
        12,
        14,
        15,
        16,
        17,
        18,
        16,
        18,
        19,
        20,
        21,
        22,
        20,
        22,
        23 // left
    ];
    var uvs = [
        // Front
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        // Back
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        // Top
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        // Bottom
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        // Right
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        // Left
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0
    ];
    var normals = [
        // Front
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        // Back
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        // Top
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        // Bottom
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        // Right
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        // Left
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0,
        -1.0,
        0.0,
        0.0
    ];
    return {
        vertices: positions,
        normals: normals,
        uvs: uvs,
        indices: indices
    };
}
function createSimplePlane() {
    var unit = 0.5;
    var positions = [-unit, -unit, 0.0, unit, -unit, 0.0, unit, unit, 0.0, -unit, unit, 0.0];
    var indices = [
        0,
        1,
        2,
        0,
        2,
        3 // front
    ];
    var uvs = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    var normals = [
        // Front
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0
    ];
    return {
        vertices: positions,
        normals: normals,
        uvs: uvs,
        indices: indices
    };
}
function createSuperSimpleplane(scaleX, scaleY) {
    if (scaleX === void 0) { scaleX = 1; }
    if (scaleY === void 0) { scaleY = 1; }
    return new Float32Array([-scaleX, -scaleY, scaleX, -scaleY, -scaleX, scaleY, scaleX, scaleY]);
}

var fullscreenVertShader = "\nprecision highp float;\n\nattribute vec3 position;\n\nuniform vec2 px;\n\nvarying vec2 vUv;\n\nvoid main(){\n    vUv = vec2(0.5)+(position.xy)*0.5;\n    gl_Position = vec4(position, 1.0);\n}\n";
var fillFragShader = "\nprecision highp float;\n\nvarying vec2 vUv;\n\nvoid main(){\n    gl_FragColor = vec4(vUv, 0.0, 1.0);\n}\n";
var texFragShader = "\nprecision highp float;\n\nuniform sampler2D uTexture;\n\nvarying vec2 vUv;\n\nvoid main(){\n    vec4 texColor = texture2D(uTexture, vUv);\n    gl_FragColor = texColor;\n}\n";

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function range(min, max) {
    return (max - min) * Math.random() + min;
}
// https://stackoverflow.com/questions/32861804/how-to-calculate-the-centre-point-of-a-circle-given-three-points
function calculateCircleCenter(A, B, C) {
    var yDeltaA = B.y - A.y;
    var xDeltaA = B.x - A.x;
    var yDeltaB = C.y - B.y;
    var xDeltaB = C.x - B.x;
    var center = { x: 0, y: 0, z: 0 };
    var aSlope = yDeltaA / xDeltaA;
    var bSlope = yDeltaB / xDeltaB;
    center.x =
        (aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) /
            (2 * (bSlope - aSlope));
    center.y = (-1 * (center.x - (A.x + B.x) / 2)) / aSlope + (A.y + B.y) / 2;
    return center;
}
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

var Ray = /** @class */ (function () {
    function Ray() {
        this.isPrev = false;
        this.orig = create$2();
        this.dir = create$2();
        this.worldMatrix3Inv = create();
    }
    Ray.prototype.intersect = function (box) {
        var min = box.min, max = box.max;
        var tmin = (min.x - this.orig[0]) / this.dir[0];
        var tmax = (max.x - this.orig[0]) / this.dir[0];
        var minY = tmin * this.dir[1] + this.orig[1];
        var maxY = tmax * this.dir[1] + this.orig[1];
        if (minY > maxY) {
            var _a = this.swap(minY, maxY), minVal = _a.minVal, maxVal = _a.maxVal;
            minY = minVal;
            maxY = maxVal;
        }
        if (minY > max.y || maxY < min.y) {
            return false;
        }
        var minZ = tmin * this.dir[2] + this.orig[2];
        var maxZ = tmax * this.dir[2] + this.orig[2];
        if (minZ > maxZ) {
            var _b = this.swap(minZ, maxZ), minVal = _b.minVal, maxVal = _b.maxVal;
            minZ = minVal;
            maxZ = maxVal;
        }
        if (minZ > max.z || maxZ < min.z) {
            return false;
        }
        this.isPrev = true;
        return { tmin: tmin, tmax: tmax };
    };
    Ray.prototype.rayCast = function (faces, worldMatrixInv) {
        var transDir = create$2();
        var transOrig = create$2();
        fromMat4(this.worldMatrix3Inv, worldMatrixInv);
        transformMat3(transDir, this.dir, this.worldMatrix3Inv);
        normalize(transDir, transDir);
        transformMat4(transOrig, this.orig, worldMatrixInv);
        return this.intersectFaces(faces, transDir, transOrig);
    };
    Ray.prototype.intersectFaces = function (faces, dir, orig) {
        var intersectFace;
        for (var ii = 0; ii < faces.length; ii++) {
            var pts = faces[ii];
            var intersect = this.intersectPts(pts[0], pts[1], pts[2], dir, orig);
            if (intersect) {
                if (!intersectFace || intersectFace.t > intersect.t)
                    intersectFace = intersect;
            }
        }
        return intersectFace;
    };
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution
    // https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
    Ray.prototype.intersectPts = function (pt0, pt1, pt2, dir, orig) {
        var dir0Vec = create$2();
        var dir1Vec = create$2();
        var nVec = create$2();
        subtract(dir0Vec, pt1, pt0);
        subtract(dir1Vec, pt2, pt0);
        cross(nVec, dir0Vec, dir1Vec);
        var D = -this.dot(nVec, pt0);
        if (Math.abs(this.dot(dir, nVec)) < Number.EPSILON)
            return false;
        var t = -(this.dot(nVec, orig) + D) / this.dot(nVec, dir);
        var intersectPt = [dir[0] * t + orig[0], dir[1] * t + orig[1], dir[2] * t + orig[2]];
        var dir0 = [pt1[0] - pt0[0], pt1[1] - pt0[1], pt1[2] - pt0[2]];
        var intersectPt0 = [
            intersectPt[0] - pt0[0],
            intersectPt[1] - pt0[1],
            intersectPt[2] - pt0[2]
        ];
        var dotProduct0Vec = create$2();
        cross(dotProduct0Vec, dir0, intersectPt0);
        var judge0 = this.dot(dotProduct0Vec, nVec);
        if (judge0 < 0)
            return false;
        var dir1 = [pt2[0] - pt1[0], pt2[1] - pt1[1], pt2[2] - pt1[2]];
        var intersectPt1 = [
            intersectPt[0] - pt1[0],
            intersectPt[1] - pt1[1],
            intersectPt[2] - pt1[2]
        ];
        var dotProduct1Vec = create$2();
        cross(dotProduct1Vec, dir1, intersectPt1);
        var judge1 = this.dot(dotProduct1Vec, nVec);
        if (judge1 < 0)
            return false;
        var dir2 = [pt0[0] - pt2[0], pt0[1] - pt2[1], pt0[2] - pt2[2]];
        var intersectPt2 = [
            intersectPt[0] - pt2[0],
            intersectPt[1] - pt2[1],
            intersectPt[2] - pt2[2]
        ];
        var dotProduct2Vec = create$2();
        cross(dotProduct2Vec, dir2, intersectPt2);
        var judge2 = this.dot(dotProduct2Vec, nVec);
        if (judge2 < 0)
            return false;
        return { t: t, pt: intersectPt };
    };
    Ray.prototype.calcDirection = function (startPt, endPt) {
        var dir = create$2();
        subtract(dir, endPt, startPt);
        normalize(dir, dir);
        this.dir = dir;
        this.orig = startPt;
    };
    Ray.prototype.swap = function (valA, valB) {
        var tempVal = valA;
        valA = valB;
        valB = tempVal;
        return { minVal: valA, maxVal: valB };
    };
    Ray.prototype.dot = function (a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };
    return Ray;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var Camera = /** @class */ (function () {
    function Camera(type) {
        if (type === void 0) { type = 'camera'; }
        this.position = { x: 0, y: 0, z: 0 };
        this.lookAtPosition = { x: 0, y: 0, z: 0 };
        this.viewMatrix = create$1();
        this.viewMatrixInverse = create$1();
        this.projectionMatrix = create$1();
        this.projectionMatrixInverse = create$1();
        this.type = type;
    }
    Camera.prototype.updatePosition = function (xx, yy, zz) {
        if (xx === void 0) { xx = 0; }
        if (yy === void 0) { yy = 0; }
        if (zz === void 0) { zz = 0; }
        this.position.x = xx;
        this.position.y = yy;
        this.position.z = zz;
    };
    Camera.prototype.updateLookAtPosition = function (xx, yy, zz) {
        if (xx === void 0) { xx = 0; }
        if (yy === void 0) { yy = 0; }
        if (zz === void 0) { zz = -100; }
        this.lookAtPosition.x = xx;
        this.lookAtPosition.y = yy;
        this.lookAtPosition.z = zz;
    };
    Camera.prototype.updateViewMatrix = function () {
        lookAt(this.viewMatrix, [this.position.x, this.position.y, this.position.z], [this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z], [0, 1, 0]);
        invert(this.viewMatrixInverse, this.viewMatrix);
    };
    return Camera;
}());
// ---------------------
var PerspectiveCamera = /** @class */ (function (_super) {
    __extends(PerspectiveCamera, _super);
    function PerspectiveCamera(width, height, fov, near, far) {
        if (fov === void 0) { fov = 45; }
        if (near === void 0) { near = 0.1; }
        if (far === void 0) { far = 1000; }
        var _this = _super.call(this, 'perspective') || this;
        _this.width = width;
        _this.height = height;
        _this.fov = fov;
        _this.near = near;
        _this.far = far;
        _this.updatePerspective();
        return _this;
    }
    PerspectiveCamera.prototype.updatePerspective = function () {
        perspective(this.projectionMatrix, (this.fov / 180) * Math.PI, this.width / this.height, this.near, this.far);
        invert(this.projectionMatrixInverse, this.projectionMatrix);
    };
    PerspectiveCamera.prototype.updateSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.updatePerspective();
    };
    PerspectiveCamera.prototype.updateFocus = function (near, far) {
        if (near)
            this.near = near;
        if (far)
            this.far = far;
        this.updatePerspective();
    };
    PerspectiveCamera.prototype.updatefov = function (angle) {
        this.fov = angle;
        this.updatePerspective();
    };
    return PerspectiveCamera;
}(Camera));
// ---------------------
var OrthoCamera = /** @class */ (function (_super) {
    __extends(OrthoCamera, _super);
    function OrthoCamera(left, right, bottom, top, near, far) {
        var _this = _super.call(this, 'ortho') || this;
        _this.left = left;
        _this.right = right;
        _this.bottom = bottom;
        _this.top = top;
        _this.near = near;
        _this.far = far;
        _this.updatePerspective();
        return _this;
    }
    OrthoCamera.prototype.updateSize = function (left, right, bottom, top) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.updatePerspective();
    };
    OrthoCamera.prototype.updateFocus = function (near, far) {
        if (near)
            this.near = near;
        if (far)
            this.far = far;
        this.updatePerspective();
    };
    OrthoCamera.prototype.updatePerspective = function () {
        ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
        invert(this.projectionMatrixInverse, this.projectionMatrix);
    };
    return OrthoCamera;
}(Camera));

var DampedAction = /** @class */ (function () {
    function DampedAction() {
        this.value = 0.0;
        this.damping = 0.85;
    }
    DampedAction.prototype.addForce = function (force) {
        this.value += force;
    };
    /** updates the damping and calls {@link damped-callback}. */
    DampedAction.prototype.update = function () {
        var isActive = this.value * this.value > 0.000001;
        if (isActive) {
            this.value *= this.damping;
        }
        else {
            this.stop();
        }
        return this.value;
    };
    /** stops the damping. */
    DampedAction.prototype.stop = function () {
        this.value = 0.0;
    };
    return DampedAction;
}());
var CameraController = /** @class */ (function () {
    function CameraController(camera, domElement) {
        if (domElement === void 0) { domElement = document.body; }
        this.target = create$2();
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.isEnabled = true;
        this.targetXDampedAction = new DampedAction();
        this.targetYDampedAction = new DampedAction();
        this.targetZDampedAction = new DampedAction();
        this.targetThetaDampedAction = new DampedAction();
        this.targetPhiDampedAction = new DampedAction();
        this.targetRadiusDampedAction = new DampedAction();
        this._isShiftDown = false;
        this._rotateStart = {
            x: 9999,
            y: 9999
        };
        this._rotateEnd = {
            x: 9999,
            y: 9999
        };
        this._roatteDelta = {
            x: 9999,
            y: 9999
        };
        this._zoomDistanceEnd = 0;
        this._zoomDistance = 0;
        this.state = '';
        this.loopId = 0;
        this._panStart = { x: 0, y: 0 };
        this._panDelta = { x: 0, y: 0 };
        this._panEnd = { x: 0, y: 0 };
        if (!camera) {
            console.error('camera is undefined');
        }
        this.camera = camera;
        this.domElement = domElement;
        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.isDamping = false;
        this.dampingFactor = 0.25;
        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.isZoom = true;
        this.zoomSpeed = 1.0;
        // Set to false to disable rotating
        this.isRotate = true;
        this.rotateSpeed = 1.0;
        // Set to false to disable panning
        this.isPan = true;
        this.keyPanSpeed = 7.0; // pixels moved per arrow key push
        // Set to false to disable use of the keys
        this.enableKeys = true;
        // The four arrow keys
        this.keys = {
            LEFT: '37',
            UP: '38',
            RIGHT: '39',
            BOTTOM: '40',
            SHIFT: '16'
        };
        // for reset
        this.originTarget = create$2();
        this.originPosition = create$2();
        this.originPosition[0] = camera.position.x;
        this.originPosition[1] = camera.position.x;
        this.originPosition[2] = camera.position.x;
        var dX = this.camera.position.x;
        var dY = this.camera.position.y;
        var dZ = this.camera.position.z;
        var radius = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
        var theta = Math.atan2(this.camera.position.x, this.camera.position.z); // equator angle around y-up axis
        var phi = Math.acos(clamp(this.camera.position.y / radius, -1, 1)); // polar angle
        this._spherical = {
            radius: radius,
            theta: theta,
            phi: phi
        };
        this._bindEvens();
        this.setEventHandler();
        this.startTick();
    }
    CameraController.prototype.setEventHandler = function () {
        this.domElement.addEventListener('contextmenu', this._contextMenuHandler, false);
        this.domElement.addEventListener('mousedown', this._mouseDownHandler, false);
        this.domElement.addEventListener('wheel', this._mouseWheelHandler, false);
        this.domElement.addEventListener('touchstart', this._touchStartHandler, false);
        this.domElement.addEventListener('touchmove', this._touchMoveHandler, false);
        window.addEventListener('keydown', this._onKeyDownHandler, false);
        window.addEventListener('keyup', this._onKeyUpHandler, false);
    };
    CameraController.prototype.removeEventHandler = function () {
        this.domElement.removeEventListener('contextmenu', this._contextMenuHandler, false);
        this.domElement.removeEventListener('mousedown', this._mouseDownHandler, false);
        this.domElement.removeEventListener('wheel', this._mouseWheelHandler, false);
        this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
        window.removeEventListener('mouseup', this._mouseUpHandler, false);
        this.domElement.removeEventListener('touchstart', this._touchStartHandler, false);
        this.domElement.removeEventListener('touchmove', this._touchMoveHandler, false);
        window.removeEventListener('keydown', this._onKeyDownHandler, false);
        window.removeEventListener('keydown', this._onKeyUpHandler, false);
    };
    CameraController.prototype.startTick = function () {
        this.loopId = requestAnimationFrame(this.tick);
    };
    CameraController.prototype.tick = function () {
        this.updateDampedAction();
        this.updateCamera();
        this.loopId = requestAnimationFrame(this.tick);
    };
    CameraController.prototype.updateDampedAction = function () {
        this.target[0] += this.targetXDampedAction.update();
        this.target[1] += this.targetYDampedAction.update();
        this.target[2] += this.targetZDampedAction.update();
        this._spherical.theta += this.targetThetaDampedAction.update();
        this._spherical.phi += this.targetPhiDampedAction.update();
        this._spherical.radius += this.targetRadiusDampedAction.update();
    };
    CameraController.prototype.updateCamera = function () {
        var s = this._spherical;
        var sinPhiRadius = Math.sin(s.phi) * s.radius;
        this.camera.position.x = sinPhiRadius * Math.sin(s.theta) + this.target[0];
        this.camera.position.y = Math.cos(s.phi) * s.radius + this.target[1];
        this.camera.position.z = sinPhiRadius * Math.cos(s.theta) + this.target[2];
        // console.log(this.camera.position);
        // console.log(this.target);
        this.camera.lookAtPosition.x = this.target[0];
        this.camera.lookAtPosition.y = this.target[1];
        this.camera.lookAtPosition.z = this.target[2];
        this.camera.updateViewMatrix();
    };
    CameraController.prototype._bindEvens = function () {
        this.tick = this.tick.bind(this);
        this._contextMenuHandler = this._contextMenuHandler.bind(this);
        this._mouseDownHandler = this._mouseDownHandler.bind(this);
        this._mouseWheelHandler = this._mouseWheelHandler.bind(this);
        this._mouseMoveHandler = this._mouseMoveHandler.bind(this);
        this._mouseUpHandler = this._mouseUpHandler.bind(this);
        this._touchStartHandler = this._touchStartHandler.bind(this);
        this._touchMoveHandler = this._touchMoveHandler.bind(this);
        this._onKeyDownHandler = this._onKeyDownHandler.bind(this);
        this._onKeyUpHandler = this._onKeyUpHandler.bind(this);
    };
    CameraController.prototype._contextMenuHandler = function (event) {
        if (!this.isEnabled)
            return;
        event.preventDefault();
    };
    CameraController.prototype._mouseDownHandler = function (event) {
        if (!this.isEnabled)
            return;
        if (event.button === 0) {
            this.state = 'rotate';
            this._rotateStart = {
                x: event.clientX,
                y: event.clientY
            };
        }
        else {
            this.state = 'pan';
            this._panStart = {
                x: event.clientX,
                y: event.clientY
            };
        }
        this.domElement.addEventListener('mousemove', this._mouseMoveHandler, false);
        window.addEventListener('mouseup', this._mouseUpHandler, false);
    };
    CameraController.prototype._mouseUpHandler = function () {
        this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
        window.removeEventListener('mouseup', this._mouseUpHandler, false);
    };
    CameraController.prototype._mouseMoveHandler = function (event) {
        if (!this.isEnabled)
            return;
        if (this.state === 'rotate') {
            this._rotateEnd = {
                x: event.clientX,
                y: event.clientY
            };
            this._roatteDelta = {
                x: this._rotateEnd.x - this._rotateStart.x,
                y: this._rotateEnd.y - this._rotateStart.y
            };
            this._updateRotateHandler();
            this._rotateStart = {
                x: this._rotateEnd.x,
                y: this._rotateEnd.y
            };
        }
        else if (this.state === 'pan') {
            this._panEnd = {
                x: event.clientX,
                y: event.clientY
            };
            this._panDelta = {
                x: -0.5 * (this._panEnd.x - this._panStart.x),
                y: 0.5 * (this._panEnd.y - this._panStart.y)
            };
            this._updatePanHandler();
            this._panStart = {
                x: this._panEnd.x,
                y: this._panEnd.y
            };
        }
        // this.update();
    };
    CameraController.prototype._mouseWheelHandler = function (event) {
        if (event.deltaY > 0) {
            this.targetRadiusDampedAction.addForce(1);
        }
        else {
            this.targetRadiusDampedAction.addForce(-1);
        }
    };
    CameraController.prototype._touchStartHandler = function (event) {
        var dX;
        var dY;
        switch (event.touches.length) {
            case 1:
                this.state = 'rotate';
                this._rotateStart = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
                break;
            case 2:
                this.state = 'zoom';
                dX = event.touches[1].clientX - event.touches[0].clientX;
                dY = event.touches[1].clientY - event.touches[0].clientY;
                this._zoomDistance = Math.sqrt(dX * dX + dY * dY);
                break;
            case 3:
                this.state = 'pan';
                this._panStart = {
                    x: (event.touches[0].clientX +
                        event.touches[1].clientX +
                        event.touches[2].clientX) /
                        3,
                    y: (event.touches[0].clientY +
                        event.touches[1].clientY +
                        event.touches[2].clientY) /
                        3
                };
                break;
        }
    };
    CameraController.prototype._touchMoveHandler = function (event) {
        var dX;
        var dY;
        var dDis;
        switch (event.touches.length) {
            case 1:
                if (this.state !== 'rotate')
                    return;
                this._rotateEnd = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
                this._roatteDelta = {
                    x: (this._rotateEnd.x - this._rotateStart.x) * 0.5,
                    y: (this._rotateEnd.y - this._rotateStart.y) * 0.5
                };
                this._updateRotateHandler();
                this._rotateStart = {
                    x: this._rotateEnd.x,
                    y: this._rotateEnd.y
                };
                break;
            case 2:
                if (this.state !== 'zoom')
                    return;
                dX = event.touches[1].clientX - event.touches[0].clientX;
                dY = event.touches[1].clientY - event.touches[0].clientY;
                this._zoomDistanceEnd = Math.sqrt(dX * dX + dY * dY);
                dDis = this._zoomDistanceEnd - this._zoomDistance;
                dDis *= 1.5;
                var targetRadius = this._spherical.radius - dDis;
                targetRadius = clamp(targetRadius, this.minDistance, this.maxDistance);
                this._zoomDistance = this._zoomDistanceEnd;
                this._spherical.radius = targetRadius;
                break;
            case 3:
                this._panEnd = {
                    x: (event.touches[0].clientX +
                        event.touches[1].clientX +
                        event.touches[2].clientX) /
                        3,
                    y: (event.touches[0].clientY +
                        event.touches[1].clientY +
                        event.touches[2].clientY) /
                        3
                };
                this._panDelta = {
                    x: this._panEnd.x - this._panStart.x,
                    y: this._panEnd.y - this._panStart.y
                };
                this._panDelta.x *= -1;
                this._updatePanHandler();
                this._panStart = {
                    x: this._panEnd.x,
                    y: this._panEnd.y
                };
                break;
        }
        // this.update();
    };
    CameraController.prototype._onKeyDownHandler = function (event) {
        var dX = 0;
        var dY = 0;
        switch (event.key) {
            case this.keys.SHIFT:
                this._isShiftDown = true;
                break;
            case this.keys.LEFT:
                dX = -10;
                break;
            case this.keys.RIGHT:
                dX = 10;
                break;
            case this.keys.UP:
                dY = 10;
                break;
            case this.keys.BOTTOM:
                dY = -10;
                break;
        }
        if (!this._isShiftDown) {
            this._panDelta = {
                x: dX,
                y: dY
            };
            this._updatePanHandler();
        }
        else {
            this._roatteDelta = {
                x: -dX,
                y: dY
            };
            this._updateRotateHandler();
        }
    };
    CameraController.prototype._onKeyUpHandler = function (event) {
        switch (event.key) {
            case this.keys.SHIFT:
                this._isShiftDown = false;
                break;
        }
    };
    CameraController.prototype._updatePanHandler = function () {
        var xDir = create$2();
        var yDir = create$2();
        var zDir = create$2();
        zDir[0] = this.target[0] - this.camera.position.x;
        zDir[1] = this.target[1] - this.camera.position.y;
        zDir[2] = this.target[2] - this.camera.position.z;
        normalize(zDir, zDir);
        cross(xDir, zDir, [0, 1, 0]);
        cross(yDir, xDir, zDir);
        var scale = Math.max(this._spherical.radius / 2000, 0.001);
        this.targetXDampedAction.addForce((xDir[0] * this._panDelta.x + yDir[0] * this._panDelta.y) * scale);
        this.targetYDampedAction.addForce((xDir[1] * this._panDelta.x + yDir[1] * this._panDelta.y) * scale);
        this.targetZDampedAction.addForce((xDir[2] * this._panDelta.x + yDir[2] * this._panDelta.y) * scale);
    };
    CameraController.prototype._updateRotateHandler = function () {
        this.targetThetaDampedAction.addForce(-this._roatteDelta.x / this.domElement.clientWidth);
        this.targetPhiDampedAction.addForce(-this._roatteDelta.y / this.domElement.clientHeight);
    };
    return CameraController;
}());

// convert layout-bmfont-text into layout
// https://github.com/Jam3/layout-bmfont-text
var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
var M_WIDTHS = ['m', 'w'];
var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var TAB_ID = '\t'.charCodeAt(0);
var SPACE_ID = ' '.charCodeAt(0);
var ALIGN_LEFT = 0;
var ALIGN_CENTER = 1;
var ALIGN_RIGHT = 2;
function number(num, def) {
    return typeof num === 'number' ? num : typeof def === 'number' ? def : 0;
}
var TextLayout = /** @class */ (function () {
    function TextLayout(data, text, options) {
        if (options === void 0) { options = {}; }
        this.options = {};
        this.glyphs = [];
        this.fontData = data;
        this.options = options;
        this.options.fontData = this.fontData;
        this.options.text = text;
        this.update();
    }
    TextLayout.prototype.update = function () {
        this.options.tabSize = this.options.tabSize ? this.options.tabSize : 4;
        if (!this.options.fontData)
            console.error('must provide a valid bitmap font');
        var glyphs = this.glyphs;
        var text = this.options.text;
        var fontData = this.options.fontData;
        this.setupSpaceGlyphs(fontData);
        // get lines
        var lines = new TextLines(text, this.options.fontData, this.options.width, this.options.start, this.options.mode, this.options.letterSpacing).lines;
        var minWidth = this.options.width || 0;
        var maxLineWidth = lines.reduce(function (prev, line) {
            return Math.max(prev, line.width, minWidth);
        }, 0);
        // clear glyphs
        glyphs = [];
        // the pen position
        var x = 0;
        var y = 0;
        var lineHeight = number(this.options.lineHeight, fontData.common.lineHeight);
        var baseline = fontData.common.base;
        var descender = lineHeight - baseline;
        var letterSpacing = this.options.letterSpacing || 0;
        var height = lineHeight * lines.length - descender;
        var align = this.getAlignType(this.options.align);
        y -= height;
        this.width = maxLineWidth;
        this.height = height;
        this.descender = lineHeight - baseline;
        this.baseline = baseline;
        this.xHeight = getXHeight(fontData);
        this.capHeight = getCapHeight(fontData);
        this.lineHeight = lineHeight;
        this.ascender = lineHeight - descender - this.xHeight;
        var self = this;
        lines.forEach(function (line, lineIndex) {
            var start = line.start;
            var end = line.end;
            var lineWidth = line.width;
            var lastGlyph;
            // for each glyph in that line...
            for (var i = start; i < end; i++) {
                var id = text.charCodeAt(i);
                var glyph = self.getGlyph(fontData, id);
                if (glyph) {
                    if (lastGlyph)
                        x += getKerning(fontData, lastGlyph.id, glyph.id);
                    var tx = x;
                    if (align === ALIGN_CENTER)
                        tx += (maxLineWidth - lineWidth) / 2;
                    else if (align === ALIGN_RIGHT)
                        tx += maxLineWidth - lineWidth;
                    glyphs.push({
                        position: [tx, y],
                        data: glyph,
                        index: i,
                        line: lineIndex
                    });
                    // move pen forward
                    x += glyph.xadvance + letterSpacing;
                    lastGlyph = glyph;
                }
            }
            // move pen forward
            y += lineHeight;
            x = 0;
        });
        this.linesTotal = lines.length;
        this.glyphs = glyphs;
    };
    TextLayout.prototype.getGlyph = function (font, id) {
        var glyph = getGlyphById(font, id);
        if (glyph)
            return glyph;
        else if (id === TAB_ID)
            return this._fallbackTabGlyph;
        else if (id === SPACE_ID)
            return this._fallbackSpaceGlyph;
        return null;
    };
    TextLayout.prototype.getAlignType = function (align) {
        if (align === 'center')
            return ALIGN_CENTER;
        else if (align === 'right')
            return ALIGN_RIGHT;
        return ALIGN_LEFT;
    };
    TextLayout.prototype.setupSpaceGlyphs = function (fontData) {
        this.fallbackSpaceGlyph = null;
        this.fallbackTabGlyph = null;
        if (!fontData.chars || fontData.chars.length === 0)
            return;
        // try to get space glyph
        // then fall back to the 'm' or 'w' glyphs
        // then fall back to the first glyph available
        var space = getGlyphById(fontData, SPACE_ID) || this.getMGlyph(fontData) || fontData.chars[0];
        var tabWidth = this.options.tabSize * space.xadvance;
        this.fallbackSpaceGlyph = space;
        this.fallbackTabGlyph = this.extendObject(space, {
            x: 0,
            y: 0,
            xadvance: tabWidth,
            id: TAB_ID,
            xoffset: 0,
            yoffset: 0,
            width: 0,
            height: 0
        });
    };
    TextLayout.prototype.extendObject = function (objectData, data) {
        var obj = {};
        for (var key in objectData) {
            obj[key] = objectData[key];
        }
        for (var key in data) {
            obj[key] = data[key];
        }
        return obj;
    };
    TextLayout.prototype.findChar = function (objectValue, value) {
        for (var key in objectValue) {
            if (objectValue[key].id === value) {
                return key;
            }
        }
        return -1;
    };
    TextLayout.prototype.getMGlyph = function (fontData) {
        for (var i = 0; i < M_WIDTHS.length; i++) {
            var id = M_WIDTHS[i].charCodeAt(0);
            var idx = this.findChar(fontData.chars, id);
            if (idx >= 0)
                return fontData.chars[idx];
        }
        return 0;
    };
    return TextLayout;
}());
var newlineChar = '\n';
var whitespace = /\s/;
var TextLines = /** @class */ (function () {
    function TextLines(text, fontData, width, start, mode, letterSpacing) {
        if (width === void 0) { width = Number.MAX_VALUE; }
        if (start === void 0) { start = 0; }
        if (mode === void 0) { mode = 'nowrap'; }
        // if(mode === )
        var end = text.length;
        this.fontData = fontData;
        this.greedy(text, start, end, width, mode);
        // this.measure(text, fontData, start, end, width,  );
    }
    TextLines.prototype.greedy = function (text, start, end, width, mode) {
        // A greedy word wrapper based on LibGDX algorithm
        // https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
        var lines = [];
        var testWidth = width;
        if (mode === 'nowrap')
            testWidth = Number.MAX_VALUE;
        while (start < end && start < text.length) {
            // get next newline position
            var newLine = this.idxOf(text, newlineChar, start, end);
            // eat whitespace at start of line
            while (start < newLine) {
                if (!this.isWhitespace(text.charAt(start)))
                    break;
                start++;
            }
            // determine visible # of glyphs for the available width
            var measured = this.measure(text, this.fontData, start, newLine, testWidth);
            var lineEnd = start + (measured.end - measured.start);
            var nextStart = lineEnd + newlineChar.length;
            // if we had to cut the line before the next newline...
            if (lineEnd < newLine) {
                // find char to break on
                while (lineEnd > start) {
                    if (this.isWhitespace(text.charAt(lineEnd)))
                        break;
                    lineEnd--;
                }
                if (lineEnd === start) {
                    if (nextStart > start + newlineChar.length)
                        nextStart--;
                    lineEnd = nextStart; // If no characters to break, show all.
                }
                else {
                    nextStart = lineEnd;
                    // eat whitespace at end of line
                    while (lineEnd > start) {
                        if (!this.isWhitespace(text.charAt(lineEnd - newlineChar.length)))
                            break;
                        lineEnd--;
                    }
                }
            }
            if (lineEnd >= start) {
                var result = this.measure(text, this.fontData, start, lineEnd, testWidth);
                lines.push(result);
            }
            start = nextStart;
        }
        this.lines = lines;
    };
    TextLines.prototype.idxOf = function (text, chr, start, end) {
        var idx = text.indexOf(chr, start);
        if (idx === -1 || idx > end)
            return end;
        return idx;
    };
    TextLines.prototype.isWhitespace = function (chr) {
        return whitespace.test(chr);
    };
    TextLines.prototype.measure = function (text, fontData, start, end, width) {
        return this.computeMetrics(text, fontData, start, end, width);
    };
    TextLines.prototype.computeMetrics = function (text, font, start, end, width, letterSpacing) {
        if (letterSpacing === void 0) { letterSpacing = 0; }
        var curPen = 0;
        var curWidth = 0;
        var count = 0;
        var glyph;
        var lastGlyph;
        if (!font.chars) {
            return {
                start: start,
                end: start,
                width: 0
            };
        }
        end = Math.min(text.length, end);
        for (var i = start; i < end; i++) {
            var id = text.charCodeAt(i);
            glyph = getGlyphById(font, id);
            // console.log(glyph);
            if (glyph) {
                var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
                curPen += kern;
                var nextPen = curPen + glyph.xadvance + letterSpacing;
                var nextWidth = curPen + glyph.width;
                // we've hit our limit; we can't move onto the next glyph
                if (nextWidth >= width || nextPen >= width)
                    break;
                // otherwise continue along our line
                curPen = nextPen;
                curWidth = nextWidth;
                lastGlyph = glyph;
            }
            count++;
        }
        if (lastGlyph)
            curWidth += lastGlyph.xoffset;
        return {
            start: start,
            end: start + count,
            width: curWidth
        };
    };
    return TextLines;
}());
function getKerning(font, lastId, nextId) {
    if (!font.kernings)
        return;
    var kernings = font.kernings;
    var firstId = kernings[lastId];
    if (firstId) {
        var kerningSpace = firstId[nextId];
        if (kerningSpace)
            return kerningSpace;
    }
    return 0;
}
function getXHeight(font) {
    for (var i = 0; i < X_HEIGHTS.length; i++) {
        var id = X_HEIGHTS[i].charCodeAt(0);
        var idx = findChar(font.chars, id);
        if (idx >= 0)
            return font.chars[idx].height;
    }
    return 0;
}
function findChar(fontChars, value) {
    for (var key in fontChars) {
        if (fontChars[key].id === value) {
            return key;
        }
    }
    return -1;
}
function getGlyphById(font, id) {
    if (!font.chars)
        return null;
    var glyphIdx = findChar(font.chars, id);
    return font.chars[glyphIdx];
}
function getCapHeight(font) {
    for (var i = 0; i < CAP_HEIGHTS.length; i++) {
        var id = CAP_HEIGHTS[i].charCodeAt(0);
        var idx = findChar(font.chars, id);
        if (idx >= 0)
            return font.chars[idx].height;
    }
    return 0;
}

var TextRendering = /** @class */ (function () {
    function TextRendering(gl, textLayout, bitmapImage) {
        var vertices = [];
        var uvs = [];
        var indices = [];
        var imageWidth = bitmapImage.width;
        var imageHeight = bitmapImage.height;
        textLayout.glyphs.forEach(function (glyph, index) {
            var bitmap = glyph.data;
            var _a = glyph.position, xx = _a[0], yy = _a[1];
            var startX = xx + bitmap.xoffset - textLayout.width / 2;
            var endX = startX + bitmap.width;
            var startY = -1 * (yy + bitmap.yoffset + textLayout.height / 2);
            var endY = startY - bitmap.height;
            var startUVX = bitmap.x / imageWidth;
            var endUVX = startUVX + bitmap.width / imageWidth;
            var startUVY = 1 - bitmap.y / imageHeight;
            var endUVY = 1 - (bitmap.y + bitmap.height) / imageHeight;
            vertices.push(startX, startY, endX, startY, endX, endY, startX, endY);
            uvs.push(startUVX, startUVY, endUVX, startUVY, endUVX, endUVY, startUVX, endUVY);
            var lastIndex = 4 * index;
            indices.push(0 + lastIndex, 2 + lastIndex, 1 + lastIndex, 0 + lastIndex, 3 + lastIndex, 2 + lastIndex);
        });
        this.vertices = new Float32Array(vertices);
        this.uvs = new Float32Array(uvs);
        this.indices = new Uint16Array(indices);
    }
    return TextRendering;
}());

var TexturePools = /** @class */ (function () {
    function TexturePools() {
        this.textures = {};
    }
    TexturePools.GET_INSTANCE = function () {
        if (!TexturePools.instance) {
            TexturePools.instance = new TexturePools();
            // ... any one time initialization goes here ...
        }
        return TexturePools.instance;
    };
    TexturePools.GET_TEXTURE = function (name) {
        return TexturePools.instance.textures[name];
    };
    TexturePools.prototype.setGL = function (gl) {
        this.gl = gl;
        this.setImage('empty', this.createEmptyCanvas());
    };
    TexturePools.prototype.setImage = function (name, element) {
        var texture = createImageTexture(this.gl, element);
        this.textures[name] = texture;
    };
    TexturePools.prototype.createEmptyCanvas = function () {
        var canvas = document.createElement('canvas');
        canvas.width = EMPTY_CANVAS_SIZE;
        canvas.height = EMPTY_CANVAS_SIZE;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, EMPTY_CANVAS_SIZE, EMPTY_CANVAS_SIZE);
        ctx.fillStyle = EMPTY_CANVAS_COLOR;
        var cnt = 0;
        var unitWidthSize = EMPTY_CANVAS_SIZE / COLOR_REPEAT;
        for (var xx = 0; xx < COLOR_REPEAT; xx = xx + 1) {
            for (var yy = 0; yy < COLOR_REPEAT; yy = yy + 1) {
                if (cnt % 2 === 0) {
                    var xpos = xx * unitWidthSize;
                    var ypos = yy * unitWidthSize;
                    ctx.fillRect(xpos, ypos, unitWidthSize, unitWidthSize);
                }
                cnt = cnt + 1;
            }
        }
        return canvas;
    };
    return TexturePools;
}());

var SwapRenderer = /** @class */ (function () {
    function SwapRenderer(gl) {
        this.textures = {};
        this.framebuffers = {};
        this.programs = {};
        this.positionVbos = {};
        this.gl = gl;
    }
    SwapRenderer.prototype.setSize = function (width, height) {
        this.gl.viewport(0, 0, width, height);
    };
    SwapRenderer.prototype.createProgram = function (programName, vertexShader, fragmentShader) {
        var program = createProgram(this.gl, vertexShader, fragmentShader);
        this.gl.useProgram(program);
        this.programs[programName] = {
            id: program,
            uniforms: {}
        };
    };
    SwapRenderer.prototype.initTexture = function (name, width, height, type) {
        var texture = createEmptyTexture(this.gl, width, height, RGB, LINEAR, LINEAR, CLAMP_TO_EDGE, CLAMP_TO_EDGE, type);
        this.textures[name] = texture;
    };
    SwapRenderer.prototype.initTextureWithImage = function (name, type, image) {
        var texture = createCustomTypeImageTexture(this.gl, image, this.gl.RGB, type, true);
        this.textures[name] = texture;
    };
    SwapRenderer.prototype.initFramebufferForTexture = function (textureName) {
        var texture = this.textures[textureName];
        var framebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0);
        this.framebuffers[textureName] = framebuffer;
    };
    SwapRenderer.prototype.initDepthTexture = function (width, height) {
        var depth = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depth);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
    };
    SwapRenderer.prototype.setProgram = function (programName) {
        this.gl.useProgram(this.programs[programName].id);
    };
    SwapRenderer.prototype.use = function (programName) {
        this.gl.useProgram(this.programs[programName].id);
    };
    SwapRenderer.prototype.getProgram = function (programName) {
        return this.programs[programName].id;
    };
    SwapRenderer.prototype.createPositionVBO = function (name, scaleX, scaleY) {
        if (scaleX === void 0) { scaleX = 1; }
        if (scaleY === void 0) { scaleY = 1; }
        var buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, createSuperSimpleplane(scaleX, scaleY), this.gl.STATIC_DRAW);
        this.positionVbos[name] = buffer;
    };
    SwapRenderer.prototype.usePositionVBO = function () {
        var location = 0;
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, 2, this.gl.FLOAT, false, 0, 0);
    };
    SwapRenderer.prototype.updateVBO = function (name) {
        var buffer = this.positionVbos[name];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.usePositionVBO();
    };
    SwapRenderer.prototype.run = function (programName, inputNameArr, outputName) {
        this.use(programName);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers[outputName]);
        for (var ii = 0; ii < inputNameArr.length; ii = ii + 1) {
            var inputName = inputNameArr[ii];
            this.gl.activeTexture(this.gl.TEXTURE0 + ii);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[inputName]);
        }
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    };
    SwapRenderer.prototype.swapTextures = function (texture1Name, texture2Name) {
        var tempTex = this.textures[texture1Name];
        this.textures[texture1Name] = this.textures[texture2Name];
        this.textures[texture2Name] = tempTex;
        var tempFBO = this.framebuffers[texture1Name];
        this.framebuffers[texture1Name] = this.framebuffers[texture2Name];
        this.framebuffers[texture2Name] = tempFBO;
    };
    SwapRenderer.prototype.setUniform = function (programName, name, val, type) {
        var uniforms = this.programs[programName].uniforms;
        // console.log(this.programs[programName].uniforms);
        var location = uniforms[name];
        if (!location) {
            location = this.gl.getUniformLocation(this.programs[programName].id, name);
            uniforms[name] = location;
            if (!location) {
                console.warn({ programName: programName, name: name });
            }
        }
        if (type === UNIFORM_1F)
            this.gl.uniform1f(location, val);
        else if (type === UNIFORM_2F) {
            val = val;
            this.gl.uniform2f(location, val[0], val[1]);
        }
        else if (type === UNIFORM_3F) {
            val = val;
            this.gl.uniform3f(location, val[0], val[1], val[2]);
        }
        else if (type === UNIFORM_1I) {
            this.gl.uniform1i(location, val);
        }
        else if (type === UNIFORM_MAT_4F) {
            this.gl.uniformMatrix4fv(location, false, val);
        }
        else {
            console.warn('no uniform for type ' + type);
        }
    };
    SwapRenderer.prototype.reset = function () {
        this.programs = {};
        this.framebuffers = {};
        this.textures = {};
        this.positionVbos = {};
    };
    return SwapRenderer;
}());

var FBO = /** @class */ (function () {
    function FBO(gl, width, height, texture, isDepthNeed) {
        if (isDepthNeed === void 0) { isDepthNeed = false; }
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.texture =
            texture === undefined || texture === null
                ? createEmptyTexture(this.gl, width, height)
                : texture;
        this.buffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        this.bindTex();
        if (isDepthNeed) {
            this.createDepth();
            this.updateDepth();
        }
    }
    FBO.prototype.bindTex = function () {
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
    };
    FBO.prototype.createDepth = function () {
        this.depth = this.gl.createRenderbuffer();
    };
    FBO.prototype.updateDepth = function () {
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depth);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.width, this.height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depth);
    };
    FBO.prototype.bind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
    };
    FBO.prototype.unbind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    };
    FBO.prototype.resize = function (width, height, texture) {
        this.width = width;
        this.height = height;
        this.bind();
        updateEmptyImageTexture(this.gl, this.texture, width, height);
        this.bindTex();
        this.updateDepth();
    };
    FBO.prototype.getTexture = function () {
        return this.texture;
    };
    return FBO;
}());

export { CLAMP_TO_EDGE, COLOR_REPEAT, Camera, CameraController, DEPTH_COMPONENT16, EMPTY_CANVAS_COLOR, EMPTY_CANVAS_SIZE, FBO, FLOAT, LINEAR, LINEAR_MIPMAP_LINEAR, LINEAR_MIPMAP_NEAREST, NEAREST, NEAREST_MIPMAP_LINEAR, NEAREST_MIPMAP_NEAREST, OrthoCamera, PerspectiveCamera, REPEAT, RGB, Ray, SwapRenderer, TextLayout, TextLines, TextRendering, TexturePools, UNIFORM_1F, UNIFORM_1I, UNIFORM_2F, UNIFORM_3F, UNIFORM_MAT_4F, UNSIGNED_BYTE, activeTexture, addKeyword, addLineNumbers, bindBuffer, calculateCircleCenter, castMouse, clamp, compileGLShader, createAndBindDepthBuffer, createBuffer, createBufferWithLocation, createCustomTypeImageTexture, createEmptyTexture, createFrameBufferWithTexture, createImageTexture, createIndex, createProgram, createSimpleBox, createSimplePlane, createSuperSimpleplane, degToRad, fillFragShader, fullscreenVertShader, generateFaceFromIndex, getAjaxJson, getImage, getPlane, getSphere, getUniformLocations, loadDraco, mergeGeomtory, mix, radToDeg, range, texFragShader, updateArrayBuffer, updateEmptyImageTexture, updateImageTexture };
//# sourceMappingURL=dan-shari-gl.es5.js.map
