"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var gl_matrix_1 = require("gl-matrix");
var Camera = /** @class */ (function () {
    function Camera(type) {
        if (type === void 0) { type = 'camera'; }
        this.position = { x: 0, y: 0, z: 0 };
        this.lookAtPosition = { x: 0, y: 0, z: 0 };
        this.viewMatrix = gl_matrix_1.mat4.create();
        this.viewMatrixInverse = gl_matrix_1.mat4.create();
        this.projectionMatrix = gl_matrix_1.mat4.create();
        this.projectionMatrixInverse = gl_matrix_1.mat4.create();
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
        gl_matrix_1.mat4.lookAt(this.viewMatrix, [this.position.x, this.position.y, this.position.z], [this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z], [0, 1, 0]);
        gl_matrix_1.mat4.invert(this.viewMatrixInverse, this.viewMatrix);
    };
    return Camera;
}());
exports.Camera = Camera;
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
        gl_matrix_1.mat4.perspective(this.projectionMatrix, (this.fov / 180) * Math.PI, this.width / this.height, this.near, this.far);
        gl_matrix_1.mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);
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
exports.PerspectiveCamera = PerspectiveCamera;
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
        gl_matrix_1.mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
        gl_matrix_1.mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);
    };
    return OrthoCamera;
}(Camera));
exports.OrthoCamera = OrthoCamera;
//# sourceMappingURL=camera.js.map