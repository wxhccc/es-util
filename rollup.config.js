import node from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from '@rollup/plugin-typescript';
import { uglify } from 'rollup-plugin-uglify';

function createConfig(config, plugins) {
  const nodePlugin = node({
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    }
  });
  const tsPlugin = typescript({
    tsconfig: false
  });
  return Object.assign({
    input: 'src/index.ts',
    plugins: [nodePlugin, tsPlugin].concat(plugins)
  }, config);
}

function getConfig(env) {
  
  const babelPlugin = babel({
    exclude: 'node_modules/**' // 只编译我们的源代码
  })
  const umdCfg = createConfig({
    output: {
      file: 'lib/index.js',
      format: 'cjs'
    },
    watch: {
      include: 'src/**'
    }
  }, [babelPlugin]);
  const esCfg = createConfig({
    output: {
      file: 'lib/index.es.js',
      format: 'es'
    }
  });
  const umdMinCfg = createConfig({
    output: {
      file: 'lib/index.mins.js',
      name: 'EsUtil',
      format: 'umd'
    }
  }, [babelPlugin, uglify()]);
  return env === 'development' ? umdCfg : [umdCfg, esCfg, umdMinCfg];
}
export default getConfig(process.env.NODE_ENV)