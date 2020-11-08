const nodeExternals = require('webpack-node-externals');
const path = require("path");

module.exports = {
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, "../../node_modules"),
    }),
  ],
};