module.exports = {
	root: true,
	env: {
		node: true,
		commonjs: true,
		es6: true,
		jquery: false,
		jest: true,
		jasmine: true
	},
	extends: 'airbnb-base',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: '2020'
	},
	rules: {
		indent: [
			'warn',
			'tab',
			{ SwitchCase: 1 }
		],
		quotes: [
			'warn',
			'single'
		],
		semi: [
			'error',
			'always'
		],
		'comma-dangle': [
			'warn',
			'never'
		],
		'no-var': [
			'error'
		],
		'no-console': [
			'off'
		],
		'no-tabs': [
			'off'
		],
		'no-unused-vars': [
			'warn'
		],
		'no-mixed-spaces-and-tabs': [
			'warn'
		],
		'func-names': 'off',
		'global-require': 'off',
		'max-len': 'off'
	}
};
