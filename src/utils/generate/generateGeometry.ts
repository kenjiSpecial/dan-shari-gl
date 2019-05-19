export function getSphere(
	radius: number = 2,
	latitudeBands: number = 64,
	longitudeBands: number = 64
) {
	const vertices = [];
	const textures = [];
	const normals = [];
	const indices = [];

	for (let latNumber = 0; latNumber <= latitudeBands; latNumber = latNumber + 1) {
		const theta = (latNumber * Math.PI) / latitudeBands;
		const sinTheta = Math.sin(theta);
		const cosTheta = Math.cos(theta);

		for (let longNumber = 0; longNumber <= longitudeBands; longNumber = longNumber + 1) {
			const phi = (longNumber * 2 * Math.PI) / longitudeBands;
			const sinPhi = Math.sin(phi);
			const cosPhi = Math.cos(phi);

			const x = cosPhi * sinTheta;
			const y = cosTheta;
			const z = sinPhi * sinTheta;
			const u = 1 - longNumber / longitudeBands;
			const v = 1 - latNumber / latitudeBands;

			normals.push(x, y, z);
			textures.push(u, v);
			vertices.push(radius * x, radius * y, radius * z);
		}
	}

	for (let latNumber = 0; latNumber < latitudeBands; latNumber = latNumber + 1) {
		for (let longNumber = 0; longNumber < longitudeBands; longNumber = longNumber + 1) {
			let first = latNumber * (longitudeBands + 1) + longNumber;
			let second = first + longitudeBands + 1;
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

export function getPlane(
	width: number,
	height: number,
	widthSegment: number,
	heightSegment: number
) {
	let vertices = [];
	let uvs = [];
	let xRate = 1 / widthSegment;
	let yRate = 1 / heightSegment;

	// set vertices and barycentric vertices
	for (let yy = 0; yy <= heightSegment; yy++) {
		let yPos = (-0.5 + yRate * yy) * height;

		for (let xx = 0; xx <= widthSegment; xx++) {
			let xPos = (-0.5 + xRate * xx) * width;
			vertices.push(xPos);
			vertices.push(yPos);
			uvs.push(xx / widthSegment);
			uvs.push(yy / heightSegment);
		}
	}

	let indices = [];

	for (let yy = 0; yy < heightSegment; yy++) {
		for (let xx = 0; xx < widthSegment; xx++) {
			let rowStartNum = yy * (widthSegment + 1);
			let nextRowStartNum = (yy + 1) * (widthSegment + 1);

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

export function mergeGeomtory(
	geometries: { vertices: number[]; indices: number[]; normals: number[]; uvs: number[] }[]
) {
	const vertices = [];
	const normals = [];
	const uvs = [];
	const indices = [];

	let lastVertices = 0;

	for (let ii = 0; ii < geometries.length; ii++) {
		let geometry = geometries[ii];

		if (geometry.indices.length > 0) {
			for (let ii = 0; ii < geometry.indices.length; ii++) {
				indices.push(geometry.indices[ii] + lastVertices / 3);
			}
		}

		if (geometry.vertices.length > 0) {
			for (let ii = 0; ii < geometry.vertices.length; ii++) {
				vertices.push(geometry.vertices[ii]);
			}

			lastVertices += geometry.vertices.length;
		}

		if (geometry.normals.length > 0) {
			for (let ii = 0; ii < geometry.normals.length; ii++) {
				normals.push(geometry.normals[ii]);
			}
		}

		if (geometry.uvs.length > 0) {
			for (let ii = 0; ii < geometry.uvs.length; ii++) {
				uvs.push(geometry.uvs[ii]);
			}
		}
	}

	return {
		vertices,
		normals,
		uvs,
		indices
	};
}
