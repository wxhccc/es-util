import node from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

function getConfig (env) {
  const nodePlugin = node({
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    }
  })
  const babelPlugin = babel({
    exclude: 'node_modules/**' // 只编译我们的源代码
  })
  const umdCfg = {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      name: 'EsUtil',
      format: 'umd'
    },
    plugins: [nodePlugin, babelPlugin],
    watch: {
      include: 'src/**'
    }
  }
  const esCfg = {
    input: 'src/index.js',
    output: {
      file: 'lib/index.es.js',
      name: 'EsUtil',
      format: 'es'
    },
    plugins: [nodePlugin]
  }
  const umdMinCfg = {
    input: 'src/index.js',
    output: {
      file: 'lib/index.min.js',
      name: 'EsUtil',
      format: 'umd'
    },
    plugins: [nodePlugin, babelPlugin, uglify()]
  }
  return env === 'development' ? umdCfg : [umdCfg, esCfg, umdMinCfg]
}
export default getConfig(process.env.NODE_ENV)