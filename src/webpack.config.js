const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const absPath = '../../',
      resFileName = 'webpackModule.js';
function copyFile(source, target) {
  let rd = fs.readFileSync(source);
  fs.writeFileSync(target, rd, {flag: 'w+'});
  fs.unlink(path, (err) => {
    err;
  })
}
//copyFile(absPath +'public/' + resFileName, __dirname + 'js/' +resFileName);


module.exports = {
  mode: 'development', // production / development
  //watch: true, // слежка за изменениями файлов(или флаг при запуске)
  //watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс
  //externals: { lodash: "_" } // подключение внешних библиотек

  //файлы вхождения
  entry: {
    main: './js/main.js',
    src: './js/src.js',
    //module: './js/' + resFileName,
  },

  optimization: {
    minimize: false,
    minimizer: [new TerserPlugin({extractComments: false,}),], // Убрать комментарии
  },

  /*output: {  //результаты работы вебпак
   path: 'f:/build/js/',
   filename: 'js/[name].js'
   },*/
  output: {
    path: path.resolve(__dirname, '../assets/'),
    filename: 'js/[name].js',
    /*filename: function (o) {
      return o.chunk.entryModule.rawRequest;
    },*/ // [contenthas] - для обхода кеширования
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename     : "../assets/css/[name].css",
    }),
  ],
  /*resolve: {
    alias: {
      //"jq-ui": path.join(__dirname, "/jquery-ui"),
    }
  },*/
  //devtool: '',
  //devtool: 'cheap-source-map', //source mapping
  module: {
    /*noParse: [ /jquery\/dist\/jquery.min.js/,
               /jquery-ui\/ui\/version.js/,],*/
    rules: [
      {
        test: /module/,
        loader: 'file-loader',
        options: {
          name: '../assets/[path][name].[ext]',
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader : 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      }
    ],

  },
};
