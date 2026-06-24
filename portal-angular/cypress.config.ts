import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4201',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    video: true,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    specPattern: 'cypress/e2e/**/*.cy.ts',
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.ts',
  },
});
