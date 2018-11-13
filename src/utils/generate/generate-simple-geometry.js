// segment is one
export function createSimpleBox(width, height, depth) {
	let x = -width / 2;
	let y = -height / 2;
	let z = -depth / 2;

	let fbl = {
		x: x,
		y: y,
		z: z + depth
	};
	let fbr = {
		x: x + width,
		y: y,
		z: z + depth
	};
	let ftl = {
		x: x,
		y: y + height,
		z: z + depth
	};
	let ftr = {
		x: x + width,
		y: y + height,
		z: z + depth
	};
	let bbl = {
		x: x,
		y: y,
		z: z
	};
	let bbr = {
		x: x + width,
		y: y,
		z: z
	};
	let btl = {
		x: x,
		y: y + height,
		z: z
	};
	let btr = {
		x: x + width,
		y: y + height,
		z: z
	};

	let positions = new Float32Array([
		//front
		fbl.x,
		fbl.y,
		fbl.z,
		fbr.x,
		fbr.y,
		fbr.z,
		ftl.x,
		ftl.y,
		ftl.z,
		ftl.x,
		ftl.y,
		ftl.z,
		fbr.x,
		fbr.y,
		fbr.z,
		ftr.x,
		ftr.y,
		ftr.z,

		//right
		fbr.x,
		fbr.y,
		fbr.z,
		bbr.x,
		bbr.y,
		bbr.z,
		ftr.x,
		ftr.y,
		ftr.z,
		ftr.x,
		ftr.y,
		ftr.z,
		bbr.x,
		bbr.y,
		bbr.z,
		btr.x,
		btr.y,
		btr.z,

		//back
		fbr.x,
		bbr.y,
		bbr.z,
		bbl.x,
		bbl.y,
		bbl.z,
		btr.x,
		btr.y,
		btr.z,
		btr.x,
		btr.y,
		btr.z,
		bbl.x,
		bbl.y,
		bbl.z,
		btl.x,
		btl.y,
		btl.z,

		//left
		bbl.x,
		bbl.y,
		bbl.z,
		fbl.x,
		fbl.y,
		fbl.z,
		btl.x,
		btl.y,
		btl.z,
		btl.x,
		btl.y,
		btl.z,
		fbl.x,
		fbl.y,
		fbl.z,
		ftl.x,
		ftl.y,
		ftl.z,

		//top
		ftl.x,
		ftl.y,
		ftl.z,
		ftr.x,
		ftr.y,
		ftr.z,
		btl.x,
		btl.y,
		btl.z,
		btl.x,
		btl.y,
		btl.z,
		ftr.x,
		ftr.y,
		ftr.z,
		btr.x,
		btr.y,
		btr.z,

		//bottom
		bbl.x,
		bbl.y,
		bbl.z,
		bbr.x,
		bbr.y,
		bbr.z,
		fbl.x,
		fbl.y,
		fbl.z,
		fbl.x,
		fbl.y,
		fbl.z,
		bbr.x,
		bbr.y,
		bbr.z,
		fbr.x,
		fbr.y,
		fbr.z
	]);

	let layoutPosition = new Float32Array([
		// front
		1,
		2,
		//
		2,
		2,
		//
		1,
		1,
		//
		//
		1,
		1,
		//
		2,
		2,
		//
		2,
		1,
		//
		// right
		//
		1 + 1,
		2,
		//
		2 + 1,
		2,
		//
		1 + 1,
		1,
		//
		//
		1 + 1,
		1,
		//
		2 + 1,
		2,
		//
		2 + 1,
		1,
		//
		// back
		//
		1 + 2,
		2,
		//
		2 + 2,
		2,
		//
		1 + 2,
		1,
		//
		//
		1 + 2,
		1,
		//
		2 + 2,
		2,
		//
		2 + 2,
		1,
		//
		//
		// back
		//
		1 - 1,
		2,
		//
		2 - 1,
		2,
		//
		1 - 1,
		1,
		//
		//
		1 - 1,
		1,
		//
		2 - 1,
		2,
		//
		2 - 1,
		1,
		//
		// top
		//
		1,
		2 - 1,
		//
		2,
		2 - 1,
		//
		1,
		1 - 1,
		//
		//
		1,
		1 - 1,
		//
		2,
		2 - 1,
		//
		2,
		1 - 1,
		//
		// bottom
		//
		1,
		2 + 1,
		//
		2,
		2 + 1,
		//
		1,
		1 + 1,
		//
		//
		1,
		1 + 1,
		//
		2,
		2 + 1,
		//
		2,
		1 + 1
		//
	]);

	let uvs = new Float32Array([
		//front
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1,
		0,
		1,
		1,

		//right
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1,
		0,
		1,
		1,

		//back
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1,
		0,
		1,
		1,

		//left
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1,
		0,
		1,
		1,

		//top
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1,
		0,
		1,
		1,

		//bottom
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1,
		0,
		1,
		1
	]);

	let normals = new Float32Array(positions.length);
	let i, count;
	let ni;

	for (i = 0, count = positions.length / 3; i < count; i++) {
		ni = i * 3;

		normals[ni] = parseInt(i / 6, 10) === 1 ? 1 : parseInt(i / 6, 10) === 3 ? -1 : 0;

		normals[ni + 1] = parseInt(i / 6, 10) === 4 ? 1 : parseInt(i / 6, 10) === 5 ? -1 : 0;

		normals[ni + 2] = parseInt(i / 6, 10) === 0 ? 1 : parseInt(i / 6, 10) === 2 ? -1 : 0;
	}

	return {
		positions: positions,
		normals: normals,
		uvs: uvs,
		layoutPosition: layoutPosition
	};
}

export function createSimplePlane(width, height) {
	let x = -width / 2;
	let y = -height / 2;

	let bl = {
		x: x,
		y: y,
		z: 0
	};
	let br = {
		x: x + width,
		y: y,
		z: 0
	};
	let tl = {
		x: x,
		y: y + height,
		z: 0
	};
	let tr = {
		x: x + width,
		y: y + height,
		z: 0
	};

	let positions = new Float32Array([
		bl.x,
		bl.y,
		bl.z,
		br.x,
		br.y,
		br.z,
		tl.x,
		tl.y,
		tl.z,
		tl.x,
		tl.y,
		tl.z,
		br.x,
		br.y,
		br.z,
		tr.x,
		tr.y,
		tr.z
	]);

	let uvs = new Float32Array([
		//front
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1,
		0,
		1,
		1
	]);

	let normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

	return {
		positions: positions,
		normals: normals,
		uvs: uvs
	};
}
