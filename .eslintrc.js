// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: `@typescript-eslint/parser`,
  env: {
    browser: true,
  },
  extends: [
    `eslint:recommended`,
    `plugin:@typescript-eslint/eslint-recommended`,
    `plugin:@typescript-eslint/recommended`,
    `plugin:react/recommended`,
    `prettier`,
  ],
  // https://github.com/yannickcr/eslint-plugin-react#configuration
  settings: {
    react: {
      version: `detect`,
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: `module`,
  },
  plugins: [`@typescript-eslint`, `react`, `prettier`],
  rules: {
    "prettier/prettier": `error`,
    "react/prop-types": 0,
    "linebreak-style": [`error`, `unix`],
    "arrow-body-style": `off`,
    "prefer-arrow-callback": `off`,
    "@typescript-eslint/ban-ts-comment": `off`,
    quotes: [`error`, `backtick`],
  },
};
