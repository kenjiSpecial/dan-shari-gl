// referrences
// -------------
// https://github.com/rollup/rollup
// https://github.com/rollup/rollup-starter-lib
// https://github.com/rollup

import commonjs from 'rollup-plugin-commonjs';
import pkg from '../package.json';
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

function glsl() {
	return {
		transform(code, id) {
			if (/\.glsl$/.test(id) === false) return;

			var transformedCode =
				'export default ' +
				JSON.stringify(
					code
						.replace(/[ \t]*\/\/.*\n/g, '') // remove //
						.replace(/[ \t]*\/\*[\s\S]*?\*\//g, '') // remove /* */
						.replace(/\n{2,}/g, '\n') // # \n+ to \n
				) +
				';';
			return {
				code: transformedCode,
				map: {
					mappings: ''
				}
			};
		}
	};
}

let defaultConfig = [];
let inputFiles = ['camera-controller.js', 'text-layout.js', 'text-rendering.js'];

for (let ii = 0; ii < inputFiles.length; ii++) {
	let input = `./plugin/${inputFiles[ii]}`;
	let outputFile0 = `build/plugin/${inputFiles[ii]}`;
	let outputFile1 = `examples/vendors/build/plugin/${inputFiles[ii]}`;

	let output0 = { name: pkg.libName, file: outputFile0, format: 'umd', extend: true };
	let output1 = { name: pkg.libName, file: outputFile1, format: 'umd', extend: true };
	let plugins = [
		glsl(),
		babel(babelrc()),
		commonjs() // so Rollup can convert `ms` to an ES module
	];

	defaultConfig.push({ input: input, output: output0, plugins: plugins });
	defaultConfig.push({ input: input, output: output1, plugins: plugins });
}

export default () => {
	console.log(defaultConfig);

	return defaultConfig;
};
