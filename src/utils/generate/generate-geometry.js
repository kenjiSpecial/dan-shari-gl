export function getSphere(radius = 2, latitudeBands = 64, longitudeBands = 64) {
	var vertices = [];
	var textures = [];
	var normals = [];
	var indices = [];

	for (var latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
		var theta = (latNumber * Math.PI) / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
			var phi = (longNumber * 2 * Math.PI) / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - longNumber / longitudeBands;
			var v = 1 - latNumber / latitudeBands;

			normals.push(x, y, z);
			textures.push(u, v);
			vertices.push(radius * x, radius * y, radius * z);
		}
	}

	for (latNumber = 0; latNumber < latitudeBands; ++latNumber) {
		for (longNumber = 0; longNumber < longitudeBands; ++longNumber) {
			var first = latNumber * (longitudeBands + 1) + longNumber;
			var second = first + longitudeBands + 1;
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

export function getPlane(width, height, widthSegment, heightSegment) {
	let vertices = [];
	let xRate = 1 / widthSegment;
	let yRate = 1 / heightSegment;

	// set vertices and barycentric vertices
	for (let yy = 0; yy <= heightSegment; yy++) {
		let yPos = (-0.5 + yRate * yy) * height;

		for (let xx = 0; xx <= widthSegment; xx++) {
			let xPos = (-0.5 + xRate * xx) * width;
			vertices.push(xPos);
			vertices.push(yPos);
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
		indices: indices
	};
}

/**
 * merge geometries into one geometry
 *
 * @param {array} geometries
 */
export function mergeGeomtory(geometries) {
	let vertices = [],
		normals = [],
		uvs = [],
		indices = [];

	let lastVertices = 0;

	for (let ii = 0; ii < geometries.length; ii++) {
		let geometry = geometries[ii];

		if (geometries.indices.length > 0) {
			for (let ii = 0; ii, geometries.indices.length; ii++) {
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
		vertices: vertices,
		normals: normals,
		uvs: uvs,
		indices: indices
	};
}
