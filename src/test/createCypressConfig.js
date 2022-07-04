const fs = require('fs');

const absPath = '../../',
      cypressTestDir = './test/',
      configFile = 'cypress.json',
      http = 'http://';

const config = {
  authLogin: 'admin',
  authPass: '123',

  viewportHeight: 960,
  viewportWidth: 1480,

  animationDistanceThreshold: 5,
  screenshotOnRunFailure: false,

  componentFolder: './core/src/test/cypress/component',
  fixturesFolder: './core/src/test/cypress/fixtures',
  integrationFolder: './core/src/test/cypress/integration',
  supportFile: './core/src/test/cypress/support/index.js',

  screenshotsFolder: './core/src/test/cypress/screenshots',
  videosFolder: './core/src/test/cypress/videos',
  downloadsFolder : './core/src/test/cypress/downloads',
  pluginsFile: './core/src/test/cypress/plugins/index.js',

  "cypress-watch-and-reload": {
    watch: [
      './core/assets/css/*',
      './core/assets/js/*',
      './core/views/*'
    ],
  },
  experimentalSessionSupport: false,
};

config.baseUrlLocal = http + /\w+$/.exec(fs.realpathSync(absPath))[0] + '/';

fs.writeFileSync(cypressTestDir + configFile, JSON.stringify(config));
console.log('complete');
