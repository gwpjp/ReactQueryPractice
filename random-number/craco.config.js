const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [new NodePolyfillPlugin()] /* An array of plugins */,
    },
    configure: (webpackConfig) => {
      return webpackConfig;
    },
  },
};
