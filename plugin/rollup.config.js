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

const defaultConfig = [
	{
		input: './plugin/camera-controller.js',
		output: {
			name: pkg.libName,
			file: 'build/plugin/camera-controller.js',
			format: 'umd',
			extend: true
		},
		plugins: [
			glsl(),
			babel(babelrc()),
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	},
	{
		input: './plugin/camera-controller.js',
		output: {
			name: pkg.libName,
			file: 'examples/vendors/build/plugin/camera-controller.js',
			format: 'umd',
			extend: true
		},
		plugins: [
			glsl(),
			babel(babelrc()),
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	}
];

export default commandLineArgs => {
	return defaultConfig;
};
