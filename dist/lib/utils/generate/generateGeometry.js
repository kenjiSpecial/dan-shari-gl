"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.getSphere = getSphere;
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
exports.getPlane = getPlane;
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
exports.mergeGeomtory = mergeGeomtory;
//# sourceMappingURL=generateGeometry.js.map