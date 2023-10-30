const fs = require('fs'),
      path = require('path'),
      webpack = require('webpack'),
      { VueLoaderPlugin } = require('vue-loader');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizer = require('css-minimizer-webpack-plugin');

const absPath = '../../',
      resFileName = 'webpackModule.json';

let entry;

if (fs.existsSync(absPath + 'public/' + resFileName)) {
  let rd = fs.readFileSync(absPath + 'public/' + resFileName, {encoding: 'utf8'});
  entry  = JSON.parse(rd);
} else {
  console.log("\x1b[31m", 'Error.\nFile webpackModule.json not exist. Check config.php and run createResourceFile!');
  process.exit();
}


module.exports = env => {
  const dev = !env.production;

  return {
    mode        : dev ? 'development' : 'production',
    watch       : dev, // слежка за изменениями файлов
    watchOptions: {aggregateTimeout: 300}, // задержка оценки изменений в мс
    entry,

    experiments: {
      outputModule: true,
    },

    output: {
      //clean   : !dev,
      path    : path.resolve(__dirname, '../../assets/'),
      filename: 'js/module/[name].js',
      library : {
        type: 'module',
      },
      scriptType: 'module',
      module    : true,
      libraryTarget: 'module',
    },

    resolve: {
      alias: {
        vue: dev ? 'vue/dist/vue.esm-bundler.js' : 'vue/dist/vue.esm-browser.prod.js',
      }
    },

    devtool: dev ? 'source-map' : false, //source mapping
    optimization: {
      minimize: !dev,
      minimizer: [
        new CssMinimizer(),
        `...`,
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/module/[name].css",
      }),
      new VueLoaderPlugin(),

      /*new HtmlWebpackPlugin({
       title: 'title',
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
      noParse: /handsontable.full.min|fullCalendar.min|canvasjs.min/,
      parser: {
        javascript: {commonjsMagicComments: true},
      },
      rules: [
        {
          test: /handsontable.full.min.js|fullCalendar.min|canvasjs.min/,
          type: "asset/resource",
          generator: {
            filename: 'js/libs/[name][ext]',
          },
        },
        getTypescriptRules(),
        getVueRules(),
        getScssRules(dev),
        getCssRules(dev),
        getImageRules(),
        getSVGRules(),
        getFontsRules(),
      ],
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------------
// Правила / Rules
// ---------------------------------------------------------------------------------------------------------------------

/** asset/resource - file-loader - в отдельный файл
 * asset/inline - url-loader - inline базе64
 * asset/source - raw-loader - ?
 * asset - автоматический выбор от размера по умолчанию 8к */

/**
 * Typescript
 * @return {object}
 */
const getTypescriptRules = () => ({
  test  : /\.ts$/,
  loader: 'ts-loader',
  exclude: /node_modules/,
  options: {
    appendTsSuffixTo: [/\.vue$/]
  },
});

/**
 * Vue
 * @return {object}
 */
const getVueRules = () => ({
  test: /\.vue$/,
  loader: "vue-loader"
});

/**
 * Scss
 * @return {object}
 */
const getScssRules = dev => ({
  test: /\.s[ac]ss$/i,
  use: [
    dev ? 'style-loader' : MiniCssExtractPlugin.loader,
    'css-loader',
    'sass-loader',
  ],
});

/**
 * Css
 * @return {object}
 */
const getCssRules = dev => ({
  test: /\.css$/i,
  use: [
    dev ? 'style-loader' : MiniCssExtractPlugin.loader,
    'css-loader',
  ],
});

/**
 * Image loader
 * @return {object}
 */
const getImageRules = () => ({
  test: /\.(png|jpe?g|gif|webp)$/i,
  type: 'asset',
  generator: {
    filename: 'image/[name][ext]',
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
 * @return {object}
 */
const getSVGRules = () => ({
  test: /\.(svg)$/,
  type: 'asset',
  generator: {
    filename: 'svg/[name][ext]',
  },
  parser: {
    dataUrlCondition: {
      maxSize: 8196, // 8kb
    }
  },
});

/**
 * Шрифты
 * @return {object}
 */
const getFontsRules = () => ({
  test: /\.(ttf|woff|woff2|eot)$/,
  type: "asset/resource",
  generator: {
    filename: 'fonts/[name][ext]',
  },
});
