import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/umd/monet-js.min.js",
    format: "umd",
    name: "monetJs",
    sourcemap: true,
    exports: "named",
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        outDir: "dist/umd",
        declaration: false,
        declarationMap: false,
      },
    }),
    terser(),
  ],
};
