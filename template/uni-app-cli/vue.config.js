const path = require('path');

module.exports = {
	publicPath: '/',
	productionSourceMap: false,
	configureWebpack: config => {
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...config.resolve.alias,
			'@': path.resolve(__dirname, 'src')
		};
		if (process.env.NODE_ENV === 'production') {
			if (config.optimization && config.optimization.minimizer && config.optimization.minimizer[0]) {
				const terserOptions = config.optimization.minimizer[0].options;
				if (terserOptions && terserOptions.terserOptions && terserOptions.terserOptions.compress) {
					terserOptions.terserOptions.compress.warnings = false;
					terserOptions.terserOptions.compress.drop_console = true;
					terserOptions.terserOptions.compress.drop_debugger = true;
					terserOptions.terserOptions.compress.pure_funcs = ['console.log'];
				}
			}
		}
	}
};
