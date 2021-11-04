const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');

const dev = process.env['npm_lifecycle_script'].includes('development');

module.exports = {
  mode: dev ? 'development' : 'production',
  watch: dev, // слежка за изменениями файлов(или флаг при запуске)
  watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс


  entry: { //файлы вхождения
    main: './js/main.js',
    src: './js/src.js',
  },

  experiments: {outputModule: true},

  output: {
    path: path.resolve(__dirname, '../assets/'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    scriptType: 'module',
    module: true,
    libraryTarget: 'module',
  },

  resolve: {
    alias: {
      vue: dev ? 'vue/dist/vue.esm-bundler.js' : 'vue/dist/vue.esm-browser.prod.js'
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
      filename: "css/admin.css",
    }),
    //new VueLoaderPlugin(),

    // Define Bundler Build Feature Flags
    new webpack.DefinePlugin({
      // Drop Options API from bundle
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
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
