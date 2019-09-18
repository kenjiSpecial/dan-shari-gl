"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gl_textures_1 = require("../utils/functions/gl-textures");
var FBO = /** @class */ (function () {
    function FBO(gl, width, height, texture, isDepthNeed) {
        if (isDepthNeed === void 0) { isDepthNeed = false; }
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.texture = texture === undefined ? gl_textures_1.createEmptyTexture(this.gl, width, height) : texture;
        this.buffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
        if (isDepthNeed) {
            this.createDepth();
        }
    }
    FBO.prototype.createDepth = function () {
        var depth = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depth);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.width, this.height);
    };
    FBO.prototype.bind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
    };
    FBO.prototype.unbind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    };
    return FBO;
}());
exports.FBO = FBO;
//# sourceMappingURL=fbo.js.map