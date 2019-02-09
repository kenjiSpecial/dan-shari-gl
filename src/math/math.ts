import { Vector3 } from '../interfaces/interface';
export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function range(min: number, max: number) {
	return (max - min) * Math.random() + min;
}

// https://stackoverflow.com/questions/32861804/how-to-calculate-the-centre-point-of-a-circle-given-three-points
export function calculateCircleCenter(A: Vector3, B: Vector3, C: Vector3) {
	const yDeltaA = B.y - A.y;
	const xDeltaA = B.x - A.x;
	const yDeltaB = C.y - B.y;
	const xDeltaB = C.x - B.x;

	let center = { x: 0, y: 0, z: 0 };

	const aSlope = yDeltaA / xDeltaA;
	const bSlope = yDeltaB / xDeltaB;

	center.x =
		(aSlope * bSlope * (A.y - C.y) + bSlope * (A.x + B.x) - aSlope * (B.x + C.x)) /
		(2 * (bSlope - aSlope));
	center.y = (-1 * (center.x - (A.x + B.x) / 2)) / aSlope + (A.y + B.y) / 2;

	return center;
}

export function mix(x: number, y: number, a: number) {
	return x * (1 - a) + y * a;
}

export function degToRad(value: number) {
	// Math.PI / 180 = 0.017453292519943295
	return value * 0.017453292519943295;
}

export function radToDeg(value: number) {
	// 180 / Math.PI = 57.29577951308232
	return 57.29577951308232 * value;
}
