const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: path.resolve(__dirname, 'src', 'js', 'index.js'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [
					path.resolve(__dirname, 'src'),
					path.resolve(__dirname, 'node_modules')
				],
				use: [
					{
						loader: 'babel-loader'
					}
				]
			}, {
				test: /\.glsl$/,
				exclude: /node_modules/,
				loader: 'raw-loader'
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('development')
			}
		})
	],
	target: 'web',
	devtool: 'source-map'
};