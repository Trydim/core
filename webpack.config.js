const path = require('path');

module.exports = {
  mode: 'production', // production / development
  //watch: true, // слежка за изменениями файлов(или флаг при запуске)
  //watchOptions: { aggregateTimeout: 300 }, // задержка оценки изменений в мс
  // externals: { lodash: "_" } // подключение внешних библиотек
  entry: './assets/js/control/src.js',  //файлы вхождения
  optimization: {
    minimize: false
  },
  /*output: {  //результаты работы вебпак
   path: 'f:/build/js/',
   filename: 'js/[name].js'
   },*/
  output: {
    path: path.resolve(__dirname, ''),
    filename: './assets/js/control/src.min.js' // [contenthas] - для обхода кеширования
  },
  plugins: [ ],
  resolve: {
    alias: {
      //"jq-ui": path.join(__dirname, "/jquery-ui"),
    }
  },
  devtool: '', //source mapping
  //devtool: 'cheap-source-map', //source mapping
  module: {
    noParse: [ /jquery\/dist\/jquery.min.js/,
               /jquery-ui\/ui\/version.js/,],
    rules: [ ]
  },

};
