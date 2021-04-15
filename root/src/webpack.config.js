const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: 'development', // production / development
  //watch: true, // слежка за изменениями файлов(или флаг при запуске)
  watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс
  entry: {
    calculator: './js/calculator.js',
    //function: './js/function.js',
  },

  experiments: {outputModule: true,},

  output: {
    path: path.resolve(__dirname, '../'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    scriptType: 'module',
    module: true,
    libraryTarget: 'module',
  },

  //devtool: '',
  devtool: 'cheap-source-map', //source mapping
  optimization: {
    minimize: false,
    minimizer: [new TerserPlugin({extractComments: false,}),], // Убрать комментарии
    /*splitChunks: {
      chunks     : 'all', //maxSize: 1024,
      cacheGroups: {
        commons: {
          //test: /[\\/]node_modules[\\/]/,
          // cacheGroupKey here is `commons` as the key of the cacheGroup
          name(module, chunks, cacheGroupKey) {
            const moduleFileName = module.identifier().split('/').reduceRight(item => item);
            const allChunksNames = chunks.map((item) => item.name).join('~');
            return `js/${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
          },
        }
      },
    }*/
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename     : "[name].css",
    }),
  ],
  module: {
    noParse: [ /jquery\/dist\/jquery.min.js/,
               /jquery-ui\/ui\/version.js/,
    ],
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
      },
    ],
  },
  //target: ['web', 'es5'],
}
