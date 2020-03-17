const path = require('path');

const MAIN_FILE = './vr.js';
const BUILD_PATH = '/';
const FILE_NAME = 'index';
const LIBRARY_NAME = 'OVVR';

module.exports = {
	entry: [MAIN_FILE],
	output: {
		path: path.join(__dirname, BUILD_PATH),
		filename: `${FILE_NAME}.js`,
		publicPath: '/',
		libraryTarget: 'umd',
		library: LIBRARY_NAME,
	},

	// production
	/*
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],
    */
	module: {
		rules: [
			{
				test: /\.(js)$/,
				exclude: /node_modules/,
				// use: ['babel-loader', 'eslint-loader'],

			},
		],
	},
};
