const { defineConfig } = require("cypress");
// Settings of the application under test, from the repository's .env (see abp.cjs).
const abp = require("./abp.cjs");

module.exports = defineConfig({
  projectId: "monkey-cypress.io.github.thesoftwaredesignlab",
  reporter: require.resolve('mochawesome'),
  reporterOptions: {
    reportDir: 'cypress/results',
    reportFilename: 'monkey-report',
    overwrite: true,
    json: true,
    charts: true, 
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Application explored by the monkey: an external demo. To explore the application under test,
    // use abp.ABP_URL (and log in first, see monkey.cy.js).
    baseUrl: "https://angular-6-registration-login-example.stackblitz.io",
  },
  // Cypress.expose("ABP_ADMIN_EMAIL"), etc. come from the repository's .env.
  expose: {
    ...abp,
    seed: 0xf1ae533d,
    delay: 1000,
    actions: {
      click: 10,
      scroll: 5,
      keypress: 10,
      viewport: 2,
      navigation: 4,

      smartClick: 5,
      smartCleanup: 2,
      smartInput: 5,
    },
  },
  pageLoadTimeout: 120000,
  screenshotsFolder: "cypress/results/screenshots",

  videosFolder: "cypress/results/videos",
  video: true,
  videoCompression: 32,
});
