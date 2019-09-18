// yarn start -f your_file -p 2
// parse obj file with index attributes

var fs = require('fs');
var parseOBJ = require('parse-obj');
var argv = require('minimist')(process.argv.slice(2));

var fileName = argv.f;
var precisoin = argv.p;

if (precisoin < 0 || !precisoin) {
	precision = 3;
}

if (!fileName) {
	console.log('you missed fileName. yarn start -f your_file -p detail_of_number');
	return;
}

parseOBJ(fs.createReadStream(`./obj-parser/obj/${fileName}.obj`), function(err, result) {
	if (err) {
		throw new Error('Error parsing OBJ file: ' + err);
	}

	var dataObj = {};
	updateVertex(result, dataObj);
	updateNormals(result, dataObj);
	updateUvs(result, dataObj);
	updateIndex(result, dataObj);

	writeObjFile(dataObj);
});
function updateVertex(result, dataObj) {
	if (result.vertexPositions.length == 0) return;

	dataObj.verts = [];

	for (let ii = 0; ii < result.facePositions.length; ii++) {
		for (let jj = 0, length = result.facePositions[ii].length - 2; jj < length; jj++) {
			// dataObj.index[ii][jj] = Number(dataObj.index[ii][jj].toFixed(precisoin));
			let index0 = (0 + jj * 2) % result.facePositions[ii].length;
			let index1 = (1 + jj * 2) % result.facePositions[ii].length;
			let index2 = (2 + jj * 2) % result.facePositions[ii].length;

			let faceIndex0 = result.facePositions[ii][index0];
			let faceIndex1 = result.facePositions[ii][index1];
			let faceIndex2 = result.facePositions[ii][index2];

			let pos0 = result.vertexPositions[faceIndex0];
			let pos1 = result.vertexPositions[faceIndex1];
			let pos2 = result.vertexPositions[faceIndex2];

			dataObj.verts.push(
				Number(pos0[0].toFixed(precision)),
				Number(pos0[1].toFixed(precision)),
				Number(pos0[2].toFixed(precision)),
				Number(pos1[0].toFixed(precision)),
				Number(pos1[1].toFixed(precision)),
				Number(pos1[2].toFixed(precision)),
				Number(pos2[0].toFixed(precision)),
				Number(pos2[1].toFixed(precision)),
				Number(pos2[2].toFixed(precision))
			);
		}
	}
}

function updateNormals(result, dataObj) {
	if (result.vertexNormals.length == 0) return;

	dataObj.normals = [];

	for (let ii = 0; ii < result.faceNormals.length; ii++) {
		for (let jj = 0, length = result.faceNormals[ii].length - 2; jj < length; jj++) {
			// dataObj.index[ii][jj] = Number(dataObj.index[ii][jj].toFixed(precisoin));
			let index0 = (0 + jj * 2) % result.faceNormals[ii].length;
			let index1 = (1 + jj * 2) % result.faceNormals[ii].length;
			let index2 = (2 + jj * 2) % result.faceNormals[ii].length;

			let faceIndex0 = result.faceNormals[ii][index0];
			let faceIndex1 = result.faceNormals[ii][index1];
			let faceIndex2 = result.faceNormals[ii][index2];

			let pos0 = result.vertexNormals[faceIndex0];
			let pos1 = result.vertexNormals[faceIndex1];
			let pos2 = result.vertexNormals[faceIndex2];

			// dataObj.normals.push(pos0[0], pos0[1], pos0[2], pos1[0], pos1[1], pos1[2], pos2[0], pos2[1], pos2[2]);
			dataObj.normals.push(
				Number(pos0[0].toFixed(precision)),
				Number(pos0[1].toFixed(precision)),
				Number(pos0[2].toFixed(precision)),
				Number(pos1[0].toFixed(precision)),
				Number(pos1[1].toFixed(precision)),
				Number(pos1[2].toFixed(precision)),
				Number(pos2[0].toFixed(precision)),
				Number(pos2[1].toFixed(precision)),
				Number(pos2[2].toFixed(precision))
			);
		}
	}
}

function updateUvs(result, dataObj) {
	// dataObj
	if (result.vertexUVs.length == 0) return;

	dataObj.texcoords = [];

	for (let ii = 0; ii < result.faceUVs.length; ii++) {
		for (let jj = 0, length = result.faceUVs[ii].length - 2; jj < length; jj++) {
			// dataObj.index[ii][jj] = Number(dataObj.index[ii][jj].toFixed(precisoin));
			let index0 = (0 + jj * 2) % result.faceUVs[ii].length;
			let index1 = (1 + jj * 2) % result.faceUVs[ii].length;
			let index2 = (2 + jj * 2) % result.faceUVs[ii].length;

			let faceIndex0 = result.faceUVs[ii][index0];
			let faceIndex1 = result.faceUVs[ii][index1];
			let faceIndex2 = result.faceUVs[ii][index2];

			let pos0 = result.vertexUVs[faceIndex0];
			let pos1 = result.vertexUVs[faceIndex1];
			let pos2 = result.vertexUVs[faceIndex2];

			// dataObj.texcoords.push(pos0[0], pos0[1], pos1[0], pos1[1], pos2[0], pos2[1]);
			dataObj.texcoords.push(
				Number(pos0[0].toFixed(precision)),
				Number(pos0[1].toFixed(precision)),
				Number(pos1[0].toFixed(precision)),
				Number(pos1[1].toFixed(precision)),
				Number(pos2[0].toFixed(precision)),
				Number(pos2[1].toFixed(precision))
			);
		}
	}
}

function updateIndex(result, dataObj) {
	dataObj.indices = [];

	for (let ii = 0; ii < result.facePositions.length; ii++) {
		let cnt;
		if (result.facePositions[ii].length === 3) cnt = 3;
		else cnt = 6;

		for (let jj = 0; jj < cnt; jj++) {
			dataObj.indices.push(dataObj.indices.length);
		}
	}
}

function writeObjFile(dataObj) {
	const content = JSON.stringify(dataObj);

	fs.writeFile(`./examples/assets/data/${fileName}.json`, content, 'utf8', function(err) {
		if (err) {
			return console.log(err);
		}

		console.log('json file was saved.');
	});
}
