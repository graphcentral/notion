const path = require('path');
const ForkTsCheckerWebpackPlugin = require(`fork-ts-checker-webpack-plugin`);
const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    '@storybook/addon-storysource',
    '@storybook/addon-a11y',
  ],
  webpackFinal: (config) => {
    config.plugins = [
      ...config.plugins, 
      new ForkTsCheckerWebpackPlugin(),
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /a\.js|node_modules/,
        // include specific files based on a RegExp
        // include: /src/,
        // add errors to webpack instead of warnings
        failOnError: false,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      })
    ]
    // https://stackoverflow.com/questions/67070802/webpack-5-and-storybook-6-integration-throws-an-error-in-defineplugin-js
    config.resolve.fallback = {
      http: false,
      path: false,
      crypto: false,
    }

    return config;
  },
  core: {
    builder: "webpack5",
  }
}