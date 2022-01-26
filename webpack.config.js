const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    background: ['regenerator-runtime/runtime', './src/background.js'],
    'content-script': ['regenerator-runtime/runtime', './src/content-script.js'],
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },

  mode: isProd ? 'production' : 'development',

  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.png$/,
        exclude: /node_modules/,
        use: ['url-loader'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html',
    }),

    new VueLoaderPlugin(),
  ],
};
