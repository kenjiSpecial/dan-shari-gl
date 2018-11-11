export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

export function range(min, max) {
	return (max - min) * Math.random() + min;
}

// https://stackoverflow.com/questions/32861804/how-to-calculate-the-centre-point-of-a-circle-given-three-points
export function calculateCircleCenter(A, B, C) {
	var yDelta_a = B.y - A.y;
	var xDelta_a = B.x - A.x;
	var yDelta_b = C.y - B.y;
	var xDelta_b = C.x - B.x;

	let center = {};

	var aSlope = yDelta_a / xDelta_a;
	var bSlope = yDelta_b / xDelta_b;

	center.x =
		(aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) /
		(2 * (bSlope - aSlope));
	center.y = (-1 * (center.x - (A.x + B.x) / 2)) / aSlope + (A.y + B.y) / 2;

	return center;
}

/**
 * mix — linearly interpolate between two values
 *
 * @param {number} x
 * @param {number} y
 * @param {number} a
 */
export function mix(x, y, a) {
	return x * (1 - a) + y * a;
}

export function degToRad(value) {
	// Math.PI / 180 = 0.017453292519943295
	return value * 0.017453292519943295;
}

export function radToDeg(value) {
	// 180 / Math.PI = 57.29577951308232
	return 57.29577951308232 * value;
}
