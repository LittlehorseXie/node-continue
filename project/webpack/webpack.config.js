const path = require('path');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	devtool: 'inline-source-map',
	entry: '../src/index.js',
	// entry: {
	// 	index: './src/index.js',
	// 	print: './src/print.js',
	// },
	output: {
		filename: 'bundle.js',
		chunkFilename: '[name].[chunkhash].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'title'
		}),
	],
	optimization: {
		splitChunks: {
			chunks: 'all'
		}
	}
}