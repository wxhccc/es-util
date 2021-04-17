import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

function createConfig(config, plugins) {
  const nodePlugin = [resolve(), commonjs()];
  const tsPlugin = typescript({
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        emitDeclarationOnly: false,
      },
    },
  });

  return Object.assign({
    input: "src/index.ts",
    plugins: [nodePlugin, tsPlugin].concat(plugins)
  }, config);
}

function getConfig(env) {
  const babelPlugin = babel({
    exclude: "node_modules/**", // 只编译我们的源代码
  });
  const esCfg = createConfig({
    output: {
      file: pkg.module,
      format: "es",
    },
  });
  if (env === "development") return esCfg
  const cjsCfg = createConfig(
    {
      output: {
        file: pkg.main,
        format: "cjs",
        exports: "named",
      },
      watch: {
        include: "src/**",
      },
    },
    [babelPlugin]
  );

  const umdMinCfg = createConfig(
    {
      output: {
        file: pkg.unpkg,
        name: "Smartfetch",
        format: "umd",
        exports: "named",
      },
    },
    [babelPlugin, terser()]
  );
  return [cjsCfg, esCfg, umdMinCfg];
}

export default getConfig(process.env.NODE_ENV);
