const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');

const absPath = '../../',
      resFileName = 'webpackModule.json';

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

  output: {
    path: path.resolve(__dirname, '../assets/'),
    filename: 'js/module/[name]/[name].js',
    library: {
      type: 'module',
    },
    module: true,
    libraryTarget: 'module',
    /*filename: function (o) {
      return o.chunk.entryModule.rawRequest;
    },*/ // [contenthas] - для обхода кеширования
  },

  resolve: {
    alias: {
      vue: dev ? 'vue/dist/vue.esm-browser.js' : 'vue/dist/vue.esm-browser.prod.js'
    }
  },
  //devtool: '',
  devtool     : 'cheap-source-map', //source mapping
  optimization: {
    minimize: !dev,
    minimizer: [
      new TerserPlugin({extractComments: false,}), // Убрать комментарии
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/module/[name]/[name].css",
    }),
    //new VueLoaderPlugin(),

    // Define Bundler Build Feature Flags
    new webpack.DefinePlugin({
      // Drop Options API from bundle
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {loader: MiniCssExtractPlugin.loader},
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
