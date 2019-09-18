"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gl_matrix_1 = require("gl-matrix");
var Ray = /** @class */ (function () {
    function Ray() {
        this.isPrev = false;
        this.orig = gl_matrix_1.vec3.create();
        this.dir = gl_matrix_1.vec3.create();
        this.worldMatrix3Inv = gl_matrix_1.mat3.create();
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
        var transDir = gl_matrix_1.vec3.create();
        var transOrig = gl_matrix_1.vec3.create();
        gl_matrix_1.mat3.fromMat4(this.worldMatrix3Inv, worldMatrixInv);
        gl_matrix_1.vec3.transformMat3(transDir, this.dir, this.worldMatrix3Inv);
        gl_matrix_1.vec3.normalize(transDir, transDir);
        gl_matrix_1.vec3.transformMat4(transOrig, this.orig, worldMatrixInv);
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
        var dir0Vec = gl_matrix_1.vec3.create();
        var dir1Vec = gl_matrix_1.vec3.create();
        var nVec = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.subtract(dir0Vec, pt1, pt0);
        gl_matrix_1.vec3.subtract(dir1Vec, pt2, pt0);
        gl_matrix_1.vec3.cross(nVec, dir0Vec, dir1Vec);
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
        var dotProduct0Vec = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.cross(dotProduct0Vec, dir0, intersectPt0);
        var judge0 = this.dot(dotProduct0Vec, nVec);
        if (judge0 < 0)
            return false;
        var dir1 = [pt2[0] - pt1[0], pt2[1] - pt1[1], pt2[2] - pt1[2]];
        var intersectPt1 = [
            intersectPt[0] - pt1[0],
            intersectPt[1] - pt1[1],
            intersectPt[2] - pt1[2]
        ];
        var dotProduct1Vec = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.cross(dotProduct1Vec, dir1, intersectPt1);
        var judge1 = this.dot(dotProduct1Vec, nVec);
        if (judge1 < 0)
            return false;
        var dir2 = [pt0[0] - pt2[0], pt0[1] - pt2[1], pt0[2] - pt2[2]];
        var intersectPt2 = [
            intersectPt[0] - pt2[0],
            intersectPt[1] - pt2[1],
            intersectPt[2] - pt2[2]
        ];
        var dotProduct2Vec = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.cross(dotProduct2Vec, dir2, intersectPt2);
        var judge2 = this.dot(dotProduct2Vec, nVec);
        if (judge2 < 0)
            return false;
        return { t: t, pt: intersectPt };
    };
    Ray.prototype.calcDirection = function (startPt, endPt) {
        var dir = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.subtract(dir, endPt, startPt);
        gl_matrix_1.vec3.normalize(dir, dir);
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
exports.Ray = Ray;
//# sourceMappingURL=ray.js.map