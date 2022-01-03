const path    = require('path');
const webpack = require('webpack');
//const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const CssMinimizerPlugin   = require('css-minimizer-webpack-plugin');
//const TerserPlugin         = require("terser-webpack-plugin");

/**
 * Шрифты
 * для ускорения сборки шрифты прописывать в отдельном файле.
 * перед строкой с правилом содержащим url вставить как комментарий " webpackIgnore: true ",
 * путь относительно собранного файла css
 */

/**
 * Получить результирующую папку в зависимости от расположения папки src
 * @returns string
 */
const getOutputPath = () => {
  const outputPath = '../../' + (path.basename(path.resolve(__dirname, '../../')) !== 'public' ? 'public/' : '');
  return path.resolve(__dirname, outputPath);
}

module.exports = env => {
  const dev = !env.production;
  //process.env.NODE_ENV = dev ? 'development' : 'production'; // зачем это

  return {
    mode        : dev ? 'development' : 'production',
    watch       : dev, // слежка за изменениями файлов
    watchOptions: {aggregateTimeout: 300}, // задержка оценки изменений в мс
    entry       : {
      calculator: './js/calculator.js', //function: './js/function.js',
    },

    experiments: {
      outputModule: true,
    },

    output : {
      path         : getOutputPath(),
      filename     : 'js/[name].js',
      chunkFilename: 'js/[name].chunk.js',
      scriptType   : 'module',
      module       : true,
      libraryTarget: 'module',
    },
    resolve: {
      alias: {
        vue: dev ? 'vue/dist/vue.esm-bundler.js' : 'vue/dist/vue.esm-browser.prod.js',
      }
    },

    devtool: dev ? 'source-map' : false, //source mapping
    optimization: {
      minimize : !dev,

      minimizer: [
        /*new TerserPlugin({
         extractComments: false // Убрать комментарии
         }),*/
        `...`,
        /*new CssMinimizerPlugin({
         minimizerOptions: {
         preset: [
         "default",
         {discardComments: { removeAll: true }},
         ],
         },
         }),*/
      ],
      /*
       splitChunks: {
       chunks: 'all', //maxSize: 1024,
       cacheGroups: {
       commons: {
       test: /[\\/]node_modules[\\/]/, // cacheGroupKey here is `commons` as the key of the cacheGroup
       name(module, chunks, cacheGroupKey) {
       const moduleFileName = module.identifier().split('/').reduceRight(item => item);
       const allChunksNames = chunks.map((item) => item.name).join('~');
       return `js/${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
       },
       }
       },
       },*/
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/style.css",
      }),
      //new VueLoaderPlugin(),

      /*new HtmlWebpackPlugin({
       title: 'yrdy',
       filename: 'view/content.php',
       template: `content.php`,
       }),*/

      new webpack.DefinePlugin({
        // Drop Options API from bundle
        __VUE_OPTIONS_API__  : 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
      }),
    ],
    module: {
      rules: [
        getVueRules(),
        getScssRules(),
        getCssRules(),
        getImageRules(),
        getSVGRules(),
        getFontsRules(),
      ]
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------------
// Правила / Rules
// ---------------------------------------------------------------------------------------------------------------------

// asset/resource - file-loader - в отдельный файл
// asset/inline - url-loader - инлайном базе64
// asset/source - raw-loader - ?
// asset - автоматический выбор от размера по умолчанию 8к

const generator = {
  publicPath: '../', // папка относительно собранных файлов.
}

/**
 * Vue
 * @returns Object
 */
const getVueRules = () => ({
  test  : /\.vue$/,
  loader: "vue-loader"
});

/**
 * Scss
 * @returns Object
 */
const getScssRules = () => ({
  test: /\.s[ac]ss$/i,
  use : [
    MiniCssExtractPlugin.loader,
    'css-loader',
    'sass-loader',
  ],
});

/**
 * Css
 * @returns Object
 */
const getCssRules = () => ({
  test: /\.css$/i,
  use : [
    MiniCssExtractPlugin.loader,
    'css-loader',
  ],
});

/**
 * Image
 * loader: 'svgo-loader', - какой-то инлайн лоадер
 * @returns Object
 */
const getImageRules = () => ({
  test   : /\.(png|jpe?g|gif|webp)$/i,
  type   : 'asset',
  generator: {
    filename: 'image/[name][ext]',
    publicPath: generator.publicPath,
  },
  parser: {
    dataUrlCondition: {
      maxSize: 8196, // 8kb
    }
  },
});

/**
 * SVG
 * inline
 * @returns Object
 */
const getSVGRules = () => ({
  test: /\.(svg)$/,
  type: 'asset',
  generator: {
    filename: 'svg/[name][ext]',
    publicPath: generator.publicPath,
  },
  parser: {
    dataUrlCondition: {
      maxSize: 8196, // 8kb
    }
  },
});

/**
 * Шрифты
 * @returns Object
 */
const getFontsRules = () => ({
  test   : /\.(ttf|woff|woff2|eot)$/,
  type   : "asset/resource",
  generator: {
    filename: 'fonts/[name][ext]',
    publicPath: '../',
  },
});
