import node from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default [{
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      name: 'EsUtil',
      format: 'umd'
    },
    plugins: [
      node({
        customResolveOptions: {
          moduleDirectory: 'node_modules'
        }
      }),
      babel({
        exclude: 'node_modules/**' // 只编译我们的源代码
      })
    ],
    watch: {
      include: 'src/**'
    }
  },
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.es.js',
      name: 'EsUtil',
      format: 'es'
    },
    plugins: [
      node({
        customResolveOptions: {
          moduleDirectory: 'node_modules'
        }
      })
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.min.js',
      name: 'EsUtil',
      format: 'umd'
    },
    plugins: [
      node({
        customResolveOptions: {
          moduleDirectory: 'node_modules'
        }
      }),
      babel({
        exclude: 'node_modules/**' // 只编译我们的源代码
      }),
      uglify()
    ]
  }
]