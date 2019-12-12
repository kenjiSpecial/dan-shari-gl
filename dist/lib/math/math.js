"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
exports.clamp = clamp;
function range(min, max) {
    return (max - min) * Math.random() + min;
}
exports.range = range;
// https://stackoverflow.com/questions/32861804/how-to-calculate-the-centre-point-of-a-circle-given-three-points
function calculateCircleCenter(A, B, C) {
    var yDeltaA = B.y - A.y;
    var xDeltaA = B.x - A.x;
    var yDeltaB = C.y - B.y;
    var xDeltaB = C.x - B.x;
    var center = { x: 0, y: 0, z: 0 };
    var aSlope = yDeltaA / xDeltaA;
    var bSlope = yDeltaB / xDeltaB;
    center.x =
        (aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) /
            (2 * (bSlope - aSlope));
    center.y = (-1 * (center.x - (A.x + B.x) / 2)) / aSlope + (A.y + B.y) / 2;
    return center;
}
exports.calculateCircleCenter = calculateCircleCenter;
function mix(x, y, a) {
    return x * (1 - a) + y * a;
}
exports.mix = mix;
function degToRad(value) {
    // Math.PI / 180 = 0.017453292519943295
    return value * 0.017453292519943295;
}
exports.degToRad = degToRad;
function radToDeg(value) {
    // 180 / Math.PI = 57.29577951308232
    return 57.29577951308232 * value;
}
exports.radToDeg = radToDeg;
//# sourceMappingURL=math.js.map