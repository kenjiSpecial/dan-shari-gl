// segment is one
export function createSimpleBox() {
	const unit = 0.5;
	const positions = [
		// Front face
		-unit,
		-unit,
		unit,
		unit,
		-unit,
		unit,
		unit,
		unit,
		unit,
		-unit,
		unit,
		unit,

		// Back face
		-unit,
		-unit,
		-unit,
		-unit,
		unit,
		-unit,
		unit,
		unit,
		-unit,
		unit,
		-unit,
		-unit,

		// Top face
		-unit,
		unit,
		-unit,
		-unit,
		unit,
		unit,
		unit,
		unit,
		unit,
		unit,
		unit,
		-unit,

		// Bottom face
		-unit,
		-unit,
		-unit,
		unit,
		-unit,
		-unit,
		unit,
		-unit,
		unit,
		-unit,
		-unit,
		unit,

		// Right face
		unit,
		-unit,
		-unit,
		unit,
		unit,
		-unit,
		unit,
		unit,
		unit,
		unit,
		-unit,
		unit,

		// Left face
		-unit,
		-unit,
		-unit,
		-unit,
		-unit,
		unit,
		-unit,
		unit,
		unit,
		-unit,
		unit,
		-unit
	];

	const indices = [
		0,
		1,
		2,
		0,
		2,
		3, // front
		4,
		5,
		6,
		4,
		6,
		7, // back
		8,
		9,
		10,
		8,
		10,
		11, // top
		12,
		13,
		14,
		12,
		14,
		15, // bottom
		16,
		17,
		18,
		16,
		18,
		19, // right
		20,
		21,
		22,
		20,
		22,
		23 // left
	];

	const uvs = [
		// Front
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		1.0,
		// Back
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		1.0,
		// Top
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		1.0,
		// Bottom
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		1.0,
		// Right
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		1.0,
		// Left
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		1.0
	];

	const normals = [
		// Front
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,

		// Back
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,

		// Top
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,

		// Bottom
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,

		// Right
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,

		// Left
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0
	];

	return {
		vertices: positions,
		normals: normals,
		uvs: uvs,
		indices: indices
	};
}

export function createSimplePlane() {
	const unit = 0.5;

	const positions = [-unit, -unit, 0.0, unit, -unit, 0.0, unit, unit, 0.0, -unit, unit, 0.0];

	const indices = [
		0,
		1,
		2,
		0,
		2,
		3 // front
	];

	const uvs = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

	const normals = [
		// Front
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0
	];

	return {
		vertices: positions,
		normals: normals,
		uvs: uvs,
		indices: indices
	};
}

export function createSuperSimpleplane(scaleX: number = 1, scaleY: number = 1) {
	return new Float32Array([-scaleX, -scaleY, scaleX, -scaleY, -scaleX, scaleY, scaleX, scaleY]);
}
