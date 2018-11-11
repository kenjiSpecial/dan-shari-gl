import * as glMatrix from './common';

export function create() {
	let out = new glMatrix.ARRAY_TYPE(16);
	if (glMatrix.ARRAY_TYPE != Float32Array) {
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
	}
	out[0] = 1;
	out[5] = 1;
	out[10] = 1;
	out[15] = 1;
	return out;
}

export function multiply(out, a, b) {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3];
	let a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7];
	let a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11];
	let a30 = a[12],
		a31 = a[13],
		a32 = a[14],
		a33 = a[15];
	// Cache only the current line of the second matrix
	let b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3];
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
}

export function perspective(out, fovy, aspect, near, far) {
	let f = 1.0 / Math.tan(fovy / 2),
		nf;
	out[0] = f / aspect;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = f;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[11] = -1;
	out[12] = 0;
	out[13] = 0;
	out[15] = 0;
	if (far != null && far !== Infinity) {
		nf = 1 / (near - far);
		out[10] = (far + near) * nf;
		out[14] = 2 * far * near * nf;
	} else {
		out[10] = -1;
		out[14] = -2 * near;
	}
	return out;
}

export function identity(out) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function clone(mat) {
	let out = new glMatrix.ARRAY_TYPE(16);
	for (let ii = 0; ii < out.length; ii++) {
		out[ii] = mat[ii];
	}

	return out;
}

export function fromTranslation(out, v) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;
	out[12] = v[0];
	out[13] = v[1];
	out[14] = v[2];
	out[15] = 1;
	return out;
}

export function fromYRotation(out, rad) {
	let s = Math.sin(rad);
	let c = Math.cos(rad);
	// Perform axis-specific matrix multiplication

	out[0] = c;
	out[1] = 0;
	out[2] = -s;
	out[3] = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = s;
	out[9] = 0;
	out[10] = c;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;

	return out;
}

export function lookAt(out, eye, center, up) {
	let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
	let eyex = eye[0];
	let eyey = eye[1];
	let eyez = eye[2];
	let upx = up[0];
	let upy = up[1];
	let upz = up[2];
	let centerx = center[0];
	let centery = center[1];
	let centerz = center[2];

	if (
		Math.abs(eyex - centerx) < glMatrix.EPSILON &&
		Math.abs(eyey - centery) < glMatrix.EPSILON &&
		Math.abs(eyez - centerz) < glMatrix.EPSILON
	) {
		return identity(out);
	}

	z0 = eyex - centerx;
	z1 = eyey - centery;
	z2 = eyez - centerz;

	len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;

	x0 = upy * z2 - upz * z1;
	x1 = upz * z0 - upx * z2;
	x2 = upx * z1 - upy * z0;
	len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	if (!len) {
		x0 = 0;
		x1 = 0;
		x2 = 0;
	} else {
		len = 1 / len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}

	y0 = z1 * x2 - z2 * x1;
	y1 = z2 * x0 - z0 * x2;
	y2 = z0 * x1 - z1 * x0;

	len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	if (!len) {
		y0 = 0;
		y1 = 0;
		y2 = 0;
	} else {
		len = 1 / len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}

	out[0] = x0;
	out[1] = y0;
	out[2] = z0;
	out[3] = 0;
	out[4] = x1;
	out[5] = y1;
	out[6] = z1;
	out[7] = 0;
	out[8] = x2;
	out[9] = y2;
	out[10] = z2;
	out[11] = 0;
	out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	out[15] = 1;

	return out;
}

export function fromRotationTranslationScale(out, q, v, s) {
	// Quaternion math
	let x = q[0],
		y = q[1],
		z = q[2],
		w = q[3];
	let x2 = x + x;
	let y2 = y + y;
	let z2 = z + z;
	let xx = x * x2;
	let xy = x * y2;
	let xz = x * z2;
	let yy = y * y2;
	let yz = y * z2;
	let zz = z * z2;
	let wx = w * x2;
	let wy = w * y2;
	let wz = w * z2;
	let sx = s[0];
	let sy = s[1];
	let sz = s[2];
	out[0] = (1 - (yy + zz)) * sx;
	out[1] = (xy + wz) * sx;
	out[2] = (xz - wy) * sx;
	out[3] = 0;
	out[4] = (xy - wz) * sy;
	out[5] = (1 - (xx + zz)) * sy;
	out[6] = (yz + wx) * sy;
	out[7] = 0;
	out[8] = (xz + wy) * sz;
	out[9] = (yz - wx) * sz;
	out[10] = (1 - (xx + yy)) * sz;
	out[11] = 0;
	out[12] = v[0];
	out[13] = v[1];
	out[14] = v[2];
	out[15] = 1;
	return out;
}

export function fromXRotation(out, rad) {
	let s = Math.sin(rad);
	let c = Math.cos(rad);
	// Perform axis-specific matrix multiplication
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = c;
	out[6] = s;
	out[7] = 0;
	out[8] = 0;
	out[9] = -s;
	out[10] = c;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
}

export function targetTo(out, eye, target, up) {
	let eyex = eye[0],
		eyey = eye[1],
		eyez = eye[2],
		upx = up[0],
		upy = up[1],
		upz = up[2];
	let z0 = eyex - target[0],
		z1 = eyey - target[1],
		z2 = eyez - target[2];
	let len = z0 * z0 + z1 * z1 + z2 * z2;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
		z0 *= len;
		z1 *= len;
		z2 *= len;
	}
	let x0 = upy * z2 - upz * z1,
		x1 = upz * z0 - upx * z2,
		x2 = upx * z1 - upy * z0;
	len = x0 * x0 + x1 * x1 + x2 * x2;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}
	out[0] = x0;
	out[1] = x1;
	out[2] = x2;
	out[3] = 0;
	out[4] = z1 * x2 - z2 * x1;
	out[5] = z2 * x0 - z0 * x2;
	out[6] = z0 * x1 - z1 * x0;
	out[7] = 0;
	out[8] = z0;
	out[9] = z1;
	out[10] = z2;
	out[11] = 0;
	out[12] = eyex;
	out[13] = eyey;
	out[14] = eyez;
	out[15] = 1;
	return out;
}

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
export function transpose(out, a) {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if (out === a) {
		let a01 = a[1],
			a02 = a[2],
			a03 = a[3];
		let a12 = a[6],
			a13 = a[7];
		let a23 = a[11];

		out[1] = a[4];
		out[2] = a[8];
		out[3] = a[12];
		out[4] = a01;
		out[6] = a[9];
		out[7] = a[13];
		out[8] = a02;
		out[9] = a12;
		out[11] = a[14];
		out[12] = a03;
		out[13] = a13;
		out[14] = a23;
	} else {
		out[0] = a[0];
		out[1] = a[4];
		out[2] = a[8];
		out[3] = a[12];
		out[4] = a[1];
		out[5] = a[5];
		out[6] = a[9];
		out[7] = a[13];
		out[8] = a[2];
		out[9] = a[6];
		out[10] = a[10];
		out[11] = a[14];
		out[12] = a[3];
		out[13] = a[7];
		out[14] = a[11];
		out[15] = a[15];
	}

	return out;
}

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
export function invert(out, a) {
	let a00 = a[0],
		a01 = a[1],
		a02 = a[2],
		a03 = a[3];
	let a10 = a[4],
		a11 = a[5],
		a12 = a[6],
		a13 = a[7];
	let a20 = a[8],
		a21 = a[9],
		a22 = a[10],
		a23 = a[11];
	let a30 = a[12],
		a31 = a[13],
		a32 = a[14],
		a33 = a[15];

	let b00 = a00 * a11 - a01 * a10;
	let b01 = a00 * a12 - a02 * a10;
	let b02 = a00 * a13 - a03 * a10;
	let b03 = a01 * a12 - a02 * a11;
	let b04 = a01 * a13 - a03 * a11;
	let b05 = a02 * a13 - a03 * a12;
	let b06 = a20 * a31 - a21 * a30;
	let b07 = a20 * a32 - a22 * a30;
	let b08 = a20 * a33 - a23 * a30;
	let b09 = a21 * a32 - a22 * a31;
	let b10 = a21 * a33 - a23 * a31;
	let b11 = a22 * a33 - a23 * a32;

	// Calculate the determinant
	let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	return out;
}
