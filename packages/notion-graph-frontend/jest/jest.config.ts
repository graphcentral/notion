import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  rootDir: `..`,
  setupFiles: [`<rootDir>/jest/setupTest.js`],
  preset: `ts-jest`,
  testEnvironment: `jsdom`,
  moduleNameMapper: {
    "src/(.*)": `<rootDir>/src/$1`,
  },
};
export default config;
