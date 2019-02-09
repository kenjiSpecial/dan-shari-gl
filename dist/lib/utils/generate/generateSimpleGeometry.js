"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// segment is one
function createSimpleBox() {
    var unit = 0.5;
    var positions = [
        // Front face
        -unit, -unit, unit,
        unit, -unit, unit,
        unit, unit, unit,
        -unit, unit, unit,
        // Back face
        -unit, -unit, -unit,
        -unit, unit, -unit,
        unit, unit, -unit,
        unit, -unit, -unit,
        // Top face
        -unit, unit, -unit,
        -unit, unit, unit,
        unit, unit, unit,
        unit, unit, -unit,
        // Bottom face
        -unit, -unit, -unit,
        unit, -unit, -unit,
        unit, -unit, unit,
        -unit, -unit, unit,
        // Right face
        unit, -unit, -unit,
        unit, unit, -unit,
        unit, unit, unit,
        unit, -unit, unit,
        // Left face
        -unit, -unit, -unit,
        -unit, -unit, unit,
        -unit, unit, unit,
        -unit, unit, -unit,
    ];
    var indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ];
    var uvs = [
        // Front
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Back
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Top
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Bottom
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Right
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Left
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    var normals = [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ];
    return {
        vertices: positions,
        normals: normals,
        uvs: uvs,
        indices: indices
    };
}
exports.createSimpleBox = createSimpleBox;
function createSimplePlane() {
    var unit = 0.5;
    var positions = [
        -unit, -unit, 0.0,
        unit, -unit, 0.0,
        unit, unit, 0.0,
        -unit, unit, 0.0
    ];
    var indices = [
        0, 1, 2, 0, 2, 3,
    ];
    var uvs = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    var normals = [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];
    return {
        vertices: positions,
        normals: normals,
        uvs: uvs,
        indices: indices
    };
}
exports.createSimplePlane = createSimplePlane;
//# sourceMappingURL=generateSimpleGeometry.js.map