'use strict';


const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const backendUrl = process.env.EDEGAL_BACKEND_URL || 'http://localhost:8000';


module.exports = {
  devtool: 'eval-source-map',
  entry: {
    app: __dirname + "/gallery/static_src/main.js",
    vendor: [
      'material-ui',
      'react',
      'react-dom',
      'react-flexbox-grid',
      'react-redux',
      'react-tap-event-plugin',
      'redux',
    ]
  },
  output: {
    path: __dirname + "/gallery/static/gallery",
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: ['', '.js', '.json', '.scss', '.css']
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: "json" },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /(\.scss|\.css)$/, loader: 'style!css!postcss!sass'}
    ]
  },
  postcss: [
    require('autoprefixer')
  ],

  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/gallery/static_src/index.tmpl.html"
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js")
  ],

  devServer: {
    colors: true,
    historyApiFallback: true,
    inline: true,
    hot: true,
    proxy: {
      '/api/*': {
        target: backendUrl,
      }
    }
  }
}
