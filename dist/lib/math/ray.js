"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gl_matrix_1 = require("gl-matrix");
var Ray = /** @class */ (function () {
    function Ray() {
        this.isPrev = false;
        this.dir = { x: 0, y: 0, z: 0 };
        this.orig = { x: 0, y: 0, z: 0 };
        this.origVec = gl_matrix_1.vec3.create();
        this.dirVec = gl_matrix_1.vec3.create();
    }
    Ray.prototype.intersect = function (box) {
        var min = box.min, max = box.max;
        var tmin = (min.x - this.orig.x) / this.dir.x;
        var tmax = (max.x - this.orig.x) / this.dir.x;
        var minY = tmin * this.dir.y + this.orig.y;
        var maxY = tmax * this.dir.y + this.orig.y;
        if (minY > maxY) {
            var _a = this.swap(minY, maxY), minVal = _a.minVal, maxVal = _a.maxVal;
            minY = minVal;
            maxY = maxVal;
        }
        if (minY > max.y || maxY < min.y) {
            return false;
        }
        var minZ = tmin * this.dir.z + this.orig.z;
        var maxZ = tmax * this.dir.z + this.orig.z;
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
    Ray.prototype.intersectFaces = function (faces) {
        // let intersectFaceArr = [];
        var intersectFace;
        for (var ii = 0; ii < faces.length; ii++) {
            var pts = faces[ii];
            var intersect = this.intersectPts(pts[0], pts[1], pts[2]);
            if (intersect) {
                if (!intersectFace || intersectFace.t > intersect.t)
                    intersectFace = intersect;
            }
        }
        return intersectFace;
    };
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution
    // https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
    Ray.prototype.intersectPts = function (pt0, pt1, pt2) {
        var dir0Vec = gl_matrix_1.vec3.create();
        var dir1Vec = gl_matrix_1.vec3.create();
        var nVec = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.subtract(dir0Vec, pt1, pt0);
        gl_matrix_1.vec3.subtract(dir1Vec, pt2, pt0);
        gl_matrix_1.vec3.cross(nVec, dir0Vec, dir1Vec);
        var D = -this.dot(nVec, pt0);
        if (Math.abs(this.dot(this.dirVec, nVec)) < Number.EPSILON)
            return false;
        var t = -(this.dot(nVec, this.origVec) + D) / this.dot(nVec, this.dirVec);
        var intersectPt = [
            this.dirVec[0] * t + this.origVec[0],
            this.dirVec[1] * t + this.origVec[1],
            this.dirVec[2] * t + this.origVec[2]
        ];
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
    Ray.prototype.rayFromPts = function (startPt, endPt) {
        var dir = gl_matrix_1.vec3.create();
        gl_matrix_1.vec3.subtract(dir, endPt, startPt);
        gl_matrix_1.vec3.normalize(dir, dir);
        this.dir = { x: dir[0], y: dir[1], z: dir[2] };
        this.dirVec = dir;
        this.orig = { x: startPt[0], y: startPt[1], z: startPt[2] };
        this.origVec = startPt;
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