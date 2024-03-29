const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    entry: {
        'content-script': ['./src/content-script.js'],
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
                type: 'asset/inline',
            },
        ],
    },

    plugins: [new VueLoaderPlugin()],
};
