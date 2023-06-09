const webpack = require('webpack');
const path = require('path');

const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'casement.min.js',
    library: 'casement',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: 'Casement: easy iFrame comms for sandboxed apps. copyright blue linden 2023, licensed under GNU GPLv3 or later.',
    }),
  ],
  module: {
    rules: [
      {
        test: /^(?!.*\.d\.ts$).*\.ts$/i,
        loader: 'ts-loader',
        exclude: [/node_modules/, /dist/],
        options: {
          configFile: 'tsconfig.webpack.json'
        }
      }
    ]
  },
  resolve: {
    extensions: [
      '.tsx',
      '.ts',
      '.js'
    ],
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
    },
  }
};

module.exports = config;