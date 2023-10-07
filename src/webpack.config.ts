import path = require('path');
import HtmlWebpackPlugin = require('html-webpack-plugin');
import NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
  devtool: "source-map",
  mode: "development",
  entry: {
    photoWars: "./photoWars.tsx",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          },
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jp(e*)g|gif|svg)$/i,
        type: 'asset'
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"]
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/',
    filename: '[name].bundle.js',
  },
  devServer: {
    static: path.resolve(__dirname, 'dist/'),
    hot: true,
    port: 3000,
    proxy: {
      '*': {
        target: 'http://localhost:8080/',
        secure: false
      }
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: './index.html'
    }),
    new NodemonPlugin({
      script: './server.ts',
      watch: [
        './server.ts',
        './definitions/**/*.ts',
        './endpoints/**/*.ts',
        './types/**/*.ts'
      ], 
      verbose: true,
    }),
  ],
};
