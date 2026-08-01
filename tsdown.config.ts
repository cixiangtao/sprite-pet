import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "browser",
  target: "es2020",
  dts: {
    sourcemap: true,
  },
  clean: true,
  sourcemap: true,
  outDir: "dist",
  outputOptions: {
    exports: "named",
  },
});
