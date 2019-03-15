let looksSame = require('looks-same');

export function saveCanvasToImage(
	gl: WebGLRenderingContext,
	width: number,
	height: number,
	filepath: string
) {
	let fs = require('fs');
	let path = require('path');
	let webGlToImgStream = require('webgl-to-img-stream');
	let outputFileStream = fs.createWriteStream(path.resolve(__dirname, filepath));
	webGlToImgStream(gl, width, height, outputFileStream);
}

export function getImagePath(name: string, type: string) {
	return `./__tests__/comparisons/${name}.${type}.png`;
}

export function isSameImage(imageName) {
	return new Promise(function(res, rej) {
		try {
			let specImage = getImagePath(imageName, 'spec');
			let curImage = getImagePath(imageName, 'cur');
			looksSame(specImage, curImage, { ignoreAntialiasing: true }, function(error, equal) {
				if (error) {
					rej(error);
				}
				res(equal);
				if (!equal) {
					console.error(`${imageName} is NOT same with spec image!
					See ${imageName}.diff.png
					`);
					genDiffImage(imageName);
				}
			});
		} catch (error) {
			rej(error);
		}
	});
}

export function genDiffImage(imageName) {
	looksSame.createDiff(
		{
			reference: getImagePath(imageName, 'spec'),
			current: getImagePath(imageName, 'cur'),
			diff: getImagePath(imageName, 'diff'),
			highlightColor: '#ff00ff', //color to highlight the differences
			strict: false, //strict comparsion
			tolerance: 2.5
		},
		function(error) {}
	);
}
