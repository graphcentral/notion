/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsconfigRaw = require(`tsconfig.json`);

// eslint-disable-next-line no-undef
module.exports = {
  entry: `./handler.ts`,
  target: `node`,
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: `esbuild-loader`,
        options: {
          loader: `tsx`,
          target: `es5`,
          tsconfigRaw,
        },
      },
    ],
  },
};
