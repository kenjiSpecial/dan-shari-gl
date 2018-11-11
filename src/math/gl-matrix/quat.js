import * as glMatrix from './common';

export function create() {
	let out = new glMatrix.ARRAY_TYPE(4);
	if (glMatrix.ARRAY_TYPE != Float32Array) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;
	}
	out[3] = 1;
	return out;
}
