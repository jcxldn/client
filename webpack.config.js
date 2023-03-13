const webpack = require("webpack");

const path = require("path");

module.exports = {
	entry: ["./src/"],
	target: ["browserslist"],
	output: {
		filename: "[name].min.js",
		path: path.resolve(__dirname, "dist"),
		library: "Client",
		libraryTarget: "umd",
	},
	// Loaders
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: "ts-loader",
				},
				exclude: [/node_modules/],
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"], // .js for axios, btoa/atob (in abab module)
	},
	// Polyfill buffer
	plugins: [
		new webpack.ProvidePlugin({
			Buffer: ["buffer", "Buffer"],
		}),
	],
};
