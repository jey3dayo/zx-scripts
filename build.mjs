import { readdirSync } from "fs";
import { join } from "path";
import * as esbuild from "esbuild";

const srcDir = "./src";
const distDir = "./dist";

// srcディレクトリ内の全ての.mjsファイルを取得
const entryPoints = readdirSync(srcDir)
  .filter((file) => file.endsWith(".mjs"))
  .map((file) => join(srcDir, file));

await esbuild.build({
  entryPoints,
  bundle: true,
  platform: "node",
  format: "esm",
  outdir: distDir,
  outExtension: { ".js": ".js" },
  banner: {
    js: "#!/usr/bin/env zx",
  },
});

console.log("Build completed!");
