const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
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

const dev = process.env['npm_lifecycle_script'].includes('development');

module.exports = {
  mode: dev ? 'development' : 'production',
  watch: dev, // слежка за изменениями файлов(или флаг при запуске)
  watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс
  entry, //файлы вхождения

  experiments: {
    outputModule: true,
  },

  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({extractComments: false,}),
      new CssMinimizerPlugin(),
    ], // Убрать комментарии
  },

  output: {
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
      filename: "css/module/[name]/[name].css",
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
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
    ],
  },
};
