import webpack from "webpack";

import type { GatsbyNode } from "gatsby";

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions }) => {
	actions.setWebpackConfig({
		// Polyfill buffer
		plugins: [
			new webpack.ProvidePlugin({
				Buffer: ["buffer", "Buffer"],
			}),
		],
	});
};
