import { defineConfig } from "tsup"
import path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: path.resolve(__dirname, `..`, `..`, `.env`) })

export default defineConfig({
  outDir: path.resolve(`.`, `dist`),
  minify: true,
  dts: true,
  target: `node16`,
  platform: `node`,
  format: [`esm`],
})
