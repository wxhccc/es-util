import path from 'path'
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const banner = `/*!
  * ${pkg.name} v${pkg.version}
  * (c) ${new Date().getFullYear()} wxhccc
  * @license MIT
  */`

let tsChecked = true

function createConfig(output, plugins = [], input) {
  const tsPlugin = typescript({
    tsconfigOverride: {
      declaration: tsChecked,
      emitDeclarationOnly: false
    },
    useTsconfigDeclarationDir: true
  });
  return  {
    input: input || "src/index.ts",
    output: Array.isArray(output) ? output.map(cfg => Object.assign(cfg, { banner })) : {
      ...output,
      banner
    },
    plugins: [resolve(), commonjs(), tsPlugin].concat(plugins)
  }
}

function getConfig(env) {
  const babelPlugin = babel({
    exclude: "node_modules/**", // 只编译我们的源代码
    babelHelpers: 'runtime'
  });
  

  const esConfig = createConfig({
    file: pkg.module,
    format: "es",
  })
  const babelOutput = [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named"
    }
  ]
  const umdOut = {
    file: pkg.unpkg,
    name: "Smartfetch",
    format: "umd",
    exports: "named",
    plugins: [terser()]
  }
  if (env === "development") return [
    esConfig,
    createConfig(babelOutput, [babelPlugin])
  ]
  babelOutput.push(umdOut)
  const singleFiles = {
    'value-string-switch': path.resolve(__dirname, 'src/value-string-switch/index.ts'),
    'object-array': path.resolve(__dirname, 'src/object-array.ts'),
    'promise': path.resolve(__dirname, 'src/promise.ts'),
    'validate': path.resolve(__dirname, 'src/validate.ts')
  }
  const singleFileEsCfg = createConfig({
    format: "es",
    dir: path.resolve(__dirname, 'dist'),
    entryFileNames: '[name].es.js'
  }, [], singleFiles)
  const singleFileCjsCfg = createConfig({
    format: "cjs",
    dir: path.resolve(__dirname, 'dist'),
    entryFileNames: '[name].js'
  }, [babelPlugin], singleFiles)
  return [
    esConfig,
    createConfig(babelOutput, [babelPlugin]),
    singleFileEsCfg,
    singleFileCjsCfg
  ]
}

export default getConfig(process.env.NODE_ENV);
