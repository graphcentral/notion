import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import tsconfigRaw from "../tsconfig.esbuild.json";

export const commonConfig: webpack.Configuration = {
  entry: `./src/index.tsx`,
  // https://webpack.js.org/plugins/split-chunks-plugin/
  optimization: {
    splitChunks: {
      chunks: `all`,
      minSize: 500,
      // minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      // enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: `esbuild-loader`,
        options: {
          loader: `tsx`,
          target: `es2015`,
          tsconfigRaw,
        },
      },
      {
        test: /\.css?$/,
        use: [`style-loader`, `css-loader`],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: `asset/resource`,
      },
    ],
  },
  resolve: {
    extensions: [`.tsx`, `.ts`, `.js`],
    alias: {
      src: path.resolve(__dirname, `..`, `src/`),
    },
  },
  output: {
    filename: `[chunkhash].[name].js`,
    path: path.resolve(__dirname, `dist`),
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new HtmlWebpackPlugin({
      template: path.join(__dirname, `..`, `public`, `index.html`),
    }),
  ],
};
