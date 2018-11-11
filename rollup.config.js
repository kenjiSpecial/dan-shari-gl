// https://github.com/rollup/rollup
// https://github.com/rollup/rollup-starter-lib
// https://github.com/rollup

import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

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

const outputConfig = {
	name: pkg.libName,
	file: pkg.main,
	format: 'umd',
	sourcemap: 'inline'
};

const debugConfig = [
	// browser-friendly UMD build
	{
		input: './src/index.js',
		output: outputConfig,
		plugins: [
			glsl(),
			babel(babelrc()),
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	}
];

const defaultConfig = [
	{
		input: './src/index.js',
		output: {
			name: pkg.libName,
			file: pkg.min,
			format: 'umd'
		},
		plugins: [
			glsl(),
			babel(babelrc()),
			resolve(), // so Rollup can find `ms`
			commonjs(), // so Rollup can convert `ms` to an ES module
			uglify()
		]
	},
	{
		input: './src/index.js',
		output: {
			name: pkg.libName,
			file: pkg.min,
			format: 'umd'
		},
		plugins: [
			glsl(),
			babel(babelrc()),
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	}
];

export default commandLineArgs => {
	if (commandLineArgs.configDebug === true) {
		return debugConfig;
	}
	return defaultConfig;
};
