const path    = require('path'),
      webpack = require('webpack'),
      { VueLoaderPlugin } = require('vue-loader');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => {
  const dev = !env.production;

  return {
    mode : dev ? 'development' : 'production',
    watch: dev, // слежка за изменениями файлов
    watchOptions: {aggregateTimeout: 300}, // задержка оценки изменений в мс
    entry       : {
      main: './js/main.ts',
      src : './js/src.js',
    },

    experiments: {
      outputModule: true,
    },

    output : {
      path      : path.resolve(__dirname, '../../assets/'),
      filename  : 'js/[name].js',
      //assetModuleFilename: '../../assets/',
      scriptType: 'module',
      module    : true,
      libraryTarget: 'module',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        vue: dev ? 'vue/dist/vue.esm-bundler.js' : 'vue/dist/vue.esm-browser.prod.js',
      }
    },

    devtool: dev ? 'source-map' : false, //source mapping
    optimization: {
      minimize : !dev,

      minimizer: [`...`],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/admin.css",
      }),
      new VueLoaderPlugin(),

      new webpack.DefinePlugin({
        // Drop Options API from bundle
        __VUE_OPTIONS_API__  : 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      }),
    ],
    module: {
      parser: {
        javascript: {commonjsMagicComments: true},
      },
      //noParse: /bootstrap5\.2/,
      rules: [
        getTypescriptRules(),
        getVueRules(),
        getScssRules(dev),
        getCssRules(dev),
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

/**
 * Mini css extract plugin
 */
const getMiniCssExtractPlugin = () => ({
  loader: MiniCssExtractPlugin.loader,
  options: {
    publicPath: '../',
  },
});

/**
 * css-loader
 * @return {object}
 */
const getCssLoader = () => ({
  loader: 'css-loader',
  options: {
    sourceMap: true,
  },
});

/**
 * Typescript
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
 */
const getVueRules = () => ({
  test  : /\.vue$/,
  loader: "vue-loader"
});

/**
 * Scss
 */
const getScssRules = dev => ({
  test: /\.s[ac]ss$/i,
  use : [
    /*dev ? 'style-loader' : */getMiniCssExtractPlugin(),
    getCssLoader(),
    'resolve-url-loader',
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true, // <-- !!IMPORTANT!!
      }
    },
  ],
});

/**
 * Css
 */
const getCssRules = dev => ({
  test: /\.css$/i,
  use : [
    /*dev ? 'style-loader' :*/ getMiniCssExtractPlugin(),
    getCssLoader(),
  ],
});

/** asset/resource - file-loader - в отдельный файл
 * asset/inline - url-loader - inline базе64
 * asset/source - raw-loader - ?
 * asset - автоматический выбор от размера по умолчанию 8к
 */

/**
 * Image
 */
const getImageRules = () => ({
  test: /\.(png|jpe?g|gif|webp)$/i,
  type: 'asset',
  generator: {
    filename: 'images/[name][ext]',
  },
  parser: {
    dataUrlCondition: {
      maxSize: 8196, // 8kb
    }
  },
});

/**
 * SVG - file-loader/inline
 */
const getSVGRules = () => ({
  test: /\.svg$/,
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
 */
const getFontsRules = () => ({
  test: /\.(ttf|woff|woff2|eot)$/,
  type: "asset/resource",
  generator: {
    filename: 'fonts/[name][ext]',
  },
});
