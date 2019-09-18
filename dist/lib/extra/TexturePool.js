"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gl_textures_1 = require("../utils/functions/gl-textures");
var constants_1 = require("../utils/common/constants");
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
        var texture = gl_textures_1.createImageTexture(this.gl, element);
        this.textures[name] = texture;
    };
    TexturePools.prototype.createEmptyCanvas = function () {
        var canvas = document.createElement('canvas');
        canvas.width = constants_1.EMPTY_CANVAS_SIZE;
        canvas.height = constants_1.EMPTY_CANVAS_SIZE;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, constants_1.EMPTY_CANVAS_SIZE, constants_1.EMPTY_CANVAS_SIZE);
        ctx.fillStyle = constants_1.EMPTY_CANVAS_COLOR;
        var cnt = 0;
        var unitWidthSize = constants_1.EMPTY_CANVAS_SIZE / constants_1.COLOR_REPEAT;
        for (var xx = 0; xx < constants_1.COLOR_REPEAT; xx = xx + 1) {
            for (var yy = 0; yy < constants_1.COLOR_REPEAT; yy = yy + 1) {
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
exports.TexturePools = TexturePools;
//# sourceMappingURL=TexturePool.js.map