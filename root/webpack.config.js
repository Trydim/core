const path = require('path');

module.exports = {
  mode: 'development', // "production" | "development" | "none"
  //watch: true, // слежка за изменениями файлов(или флаг при запуске)
  //watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс
  // externals: { lodash: "_" } // подключение внешних библиотек
  entry: './public/js/calculator.js',  //файлы вхождения
  optimization: {
    minimize: false
  },
  output: {
    /**
     * Результат
     * https://webpack.js.org/configuration/output/#outputfilename
     */
    path: path.resolve(__dirname, ''),
    filename: './public/js/calculator.min.js'
  },
  plugins: [ ],
  resolve: {
    alias: {
      //"jq-ui": path.join(__dirname, "/jquery-ui"),
    }
  },
  //devtool: '', //source mapping
  devtool: 'cheap-source-map', //source mapping
  module: {
    noParse: [ /jquery\/dist\/jquery.min.js/,
               /jquery-ui\/ui\/version.js/,],
    rules: [ ]
  },

};
