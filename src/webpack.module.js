const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const absPath = '../../',
      resFileName = 'webpackModule.js';

let entry;
function copyFile(source, target) {
  let rd = fs.readFileSync(source, {encoding: 'utf8'});
  entry = JSON.parse(rd);
  /*fs.writeFileSync(target, rd, {flag: 'w+'});
  fs.unlink(path, (err) => {
    err;
  })*/
}
//copyFile(absPath +'public/' + resFileName, __dirname + 'js/' +resFileName);

if (fs.existsSync(absPath + 'public/' + resFileName)) {
  let rd = fs.readFileSync(absPath + 'public/' + resFileName, {encoding: 'utf8'});
  entry  = JSON.parse(rd);
} else return;

module.exports = {
  mode: 'development', // production / development
  watch: true, // слежка за изменениями файлов(или флаг при запуске)

  entry, //файлы вхождения

  experiments: {
    outputModule: true,
  },

  optimization: {
    minimize: false,
    minimizer: [new TerserPlugin({extractComments: false,}),], // Убрать комментарии
  },

  output: {
    //clean: true, // Clean the output directory before emit.
    path: path.resolve(__dirname, '../assets/'),
    filename: 'js/module/[name]/[name].js',
    library: {
      type: 'module',
    },
    /*filename: function (o) {
      return o.chunk.entryModule.rawRequest;
    },*/ // [contenthas] - для обхода кеширования
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
  //devtool: '',
  devtool: 'cheap-source-map', //source mapping
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      }
    ],
  },
};
