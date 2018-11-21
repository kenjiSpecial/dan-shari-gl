import * as glMatrix from './common';

/**
 * 3x3 Matrix
 * @module mat3
 */
/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
export function create() {
	let out = new glMatrix.ARRAY_TYPE(9);
	if (glMatrix.ARRAY_TYPE != Float32Array) {
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[5] = 0;
		out[6] = 0;
		out[7] = 0;
	}
	out[0] = 1;
	out[4] = 1;
	out[8] = 1;
	return out;
}

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
export function fromMat4(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
}