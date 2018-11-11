import * as glMatrix from './common';

export function create() {
	let out = new glMatrix.ARRAY_TYPE(3);
	if (glMatrix.ARRAY_TYPE != Float32Array) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;
	}
	return out;
}

export function add(out, a, b) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	return out;
}

export function rotateZ(out, a, b, c) {
	let p = [],
		r = [];
	//Translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];
	//perform rotation
	r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
	r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
	r[2] = p[2];
	//translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];
	return out;
}

export function rotateY(out, a, b, c) {
	let p = [],
		r = [];
	//Translate point to the origin
	p[0] = a[0] - b[0];
	p[1] = a[1] - b[1];
	p[2] = a[2] - b[2];
	//perform rotation
	r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
	r[1] = p[1];
	r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);
	//translate to correct position
	out[0] = r[0] + b[0];
	out[1] = r[1] + b[1];
	out[2] = r[2] + b[2];
	return out;
}

export function transformMat4(out, a, m) {
	let x = a[0],
		y = a[1],
		z = a[2];
	let w = m[3] * x + m[7] * y + m[11] * z + m[15];
	w = w || 1.0;
	out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	return out;
}
