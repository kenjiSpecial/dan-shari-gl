"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gl_textures_1 = require("../utils/functions/gl-textures");
var FBO = /** @class */ (function () {
    function FBO(gl, width, height, texture, isDepthNeed) {
        if (isDepthNeed === void 0) { isDepthNeed = false; }
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.texture =
            texture === undefined || texture === null
                ? gl_textures_1.createEmptyTexture(this.gl, width, height)
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
        gl_textures_1.updateEmptyImageTexture(this.gl, this.texture, width, height);
        this.bindTex();
        this.updateDepth();
    };
    FBO.prototype.getTexture = function () {
        return this.texture;
    };
    return FBO;
}());
exports.FBO = FBO;
//# sourceMappingURL=fbo.js.map