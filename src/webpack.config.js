const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: 'development', // production / development
  watch: true, // слежка за изменениями файлов(или флаг при запуске)
  //watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс
  //externals: { lodash: "_" } // подключение внешних библиотек

  entry: { //файлы вхождения
    main: './js/main.js',
    src: './js/src.js',
  },

  optimization: {
    minimize: false,
    minimizer: [new TerserPlugin({extractComments: false,}),], // Убрать комментарии
  },

  output: {
    //clean: true, // Clean the output directory before emit.
    path: path.resolve(__dirname, '../assets/'),
    filename: 'js/[name].js',

    /*environment: {
     dynamicImport: true,
     module: true,
     }*/
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename     : "[name].css",
    }),
  ],
  /*resolve: {
    alias: {
      //"jq-ui": path.join(__dirname, "/jquery-ui"),
    }
  },*/
  //devtool: '',
  devtool: 'cheap-source-map', //source mapping
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
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
