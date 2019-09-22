"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../common/constants");
var gl_matrix_1 = require("gl-matrix");
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
exports.getUniformLocations = getUniformLocations;
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
exports.addLineNumbers = addLineNumbers;
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
exports.compileGLShader = compileGLShader;
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
exports.createProgram = createProgram;
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
exports.createBufferWithLocation = createBufferWithLocation;
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
exports.createBuffer = createBuffer;
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
exports.updateArrayBuffer = updateArrayBuffer;
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
exports.createIndex = createIndex;
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
    if (type === void 0) { type = constants_1.FLOAT; }
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
exports.bindBuffer = bindBuffer;
function generateFaceFromIndex(vertices, indices) {
    var faces = [];
    for (var ii = 0; ii < indices.length; ii = ii + 3) {
        var index0 = indices[ii];
        var index1 = indices[ii + 1];
        var index2 = indices[ii + 2];
        faces.push([
            gl_matrix_1.vec3.fromValues(vertices[3 * index0], vertices[3 * index0 + 1], vertices[3 * index0 + 2]),
            gl_matrix_1.vec3.fromValues(vertices[3 * index1], vertices[3 * index1 + 1], vertices[3 * index1 + 2]),
            gl_matrix_1.vec3.fromValues(vertices[3 * index2], vertices[3 * index2 + 1], vertices[3 * index2 + 2])
        ]);
    }
    return faces;
}
exports.generateFaceFromIndex = generateFaceFromIndex;
function castMouse(mouse, viewMatrixInverse, projectionMatrixInverse, depth) {
    if (depth === void 0) { depth = 0; }
    var clipSpace = gl_matrix_1.vec3.fromValues(mouse[0], mouse[1], depth);
    var cameraSpace = gl_matrix_1.vec3.create();
    var worldSpace = gl_matrix_1.vec3.create();
    gl_matrix_1.vec3.transformMat4(cameraSpace, clipSpace, projectionMatrixInverse);
    gl_matrix_1.vec3.transformMat4(worldSpace, cameraSpace, viewMatrixInverse);
    return worldSpace;
}
exports.castMouse = castMouse;
function createFrameBufferWithTexture(gl, texture) {
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return framebuffer;
}
exports.createFrameBufferWithTexture = createFrameBufferWithTexture;
function createAndBindDepthBuffer(gl, width, height) {
    var depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    return depth;
}
exports.createAndBindDepthBuffer = createAndBindDepthBuffer;
function addKeyword(sources, keywords) {
    if (keywords === null) {
        return sources;
    }
    return keywords + sources;
}
exports.addKeyword = addKeyword;
//# sourceMappingURL=gl-functions.js.map