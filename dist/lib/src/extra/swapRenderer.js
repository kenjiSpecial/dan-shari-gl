"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gl_functions_1 = require("../utils/functions/gl-functions");
var gl_textures_1 = require("../utils/functions/gl-textures");
var constants_1 = require("../utils/common/constants");
var generateSimpleGeometry_1 = require("../utils/generate/generateSimpleGeometry");
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
        var program = gl_functions_1.createProgram(this.gl, vertexShader, fragmentShader);
        this.gl.useProgram(program);
        this.programs[programName] = {
            id: program,
            uniforms: {}
        };
    };
    SwapRenderer.prototype.initTexture = function (name, width, height, type) {
        var texture = gl_textures_1.createEmptyTexture(this.gl, width, height, constants_1.RGB, constants_1.LINEAR, constants_1.LINEAR, constants_1.CLAMP_TO_EDGE, constants_1.CLAMP_TO_EDGE, type);
        this.textures[name] = texture;
    };
    SwapRenderer.prototype.initTextureWithImage = function (name, type, image) {
        var texture = gl_textures_1.createCustomTypeImageTexture(this.gl, image, this.gl.RGB, type, true);
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
        this.gl.bufferData(this.gl.ARRAY_BUFFER, generateSimpleGeometry_1.createSuperSimpleplane(scaleX, scaleY), this.gl.STATIC_DRAW);
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
        if (type === constants_1.UNIFORM_1F)
            this.gl.uniform1f(location, val);
        else if (type === constants_1.UNIFORM_2F) {
            val = val;
            this.gl.uniform2f(location, val[0], val[1]);
        }
        else if (type === constants_1.UNIFORM_3F) {
            val = val;
            this.gl.uniform3f(location, val[0], val[1], val[2]);
        }
        else if (type === constants_1.UNIFORM_1I) {
            this.gl.uniform1i(location, val);
        }
        else if (type === constants_1.UNIFORM_MAT_4F) {
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
exports.SwapRenderer = SwapRenderer;
//# sourceMappingURL=swapRenderer.js.map