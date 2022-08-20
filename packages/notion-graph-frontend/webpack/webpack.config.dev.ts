import path from "path"
import webpack from "webpack"
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27570#issuecomment-437115227
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as webpackDevServer from "webpack-dev-server"
import { commonConfig } from "./webpack.config.common"

const config: webpack.Configuration = {
  mode: `development`,
  devtool: `inline-source-map`,
  devServer: {
    static: path.join(__dirname, `dist`),
    compress: true,
    port: 8080,
    open: true,
  },
  ...commonConfig,
}

export default config
