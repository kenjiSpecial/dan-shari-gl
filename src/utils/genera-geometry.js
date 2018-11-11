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
		textures: textures,
		normals: normals,
		indices: indices
	};
}
