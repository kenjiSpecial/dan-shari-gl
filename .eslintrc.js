module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: 'eslint:recommended',
	parserOptions: {
		sourceType: 'module'
	},
	rules: {
		'arrow-body-style': ['error', 'always'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'no-console': 'off'
	}
};
