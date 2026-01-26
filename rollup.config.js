// rollup.config.js
import commonjs from '@rollup/plugin-commonjs'
import pluginResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import rollupDelete from 'rollup-plugin-delete'

import { readFileSync } from 'node:fs'
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
)

const name = pkg.name
// 将包名转换为 PascalCase 作为全局变量名（可选，也可手动指定）
const globalName = name
  .split(/[-_/]/)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')

// 提取输出目录
const cjsDir = pkg.main.replace('/index.js', '')
const esmDir = pkg.module.replace('/index.js', '')

/** @type {() => import('rollup').RollupOptions} */
const createModuleConfig = (format, dir, options = {}) => {
  return {
    input: 'src/index.ts',
    output: {
      dir,
      format,
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src', // 可选：让输出目录结构更干净
    },
    plugins: [
      options.clear &&
        rollupDelete({
          targets: 'dist',
          runOnce: true,
        }),
      replace({
        __VERSION__: JSON.stringify(pkg.version),
        __LIB_NAME__: JSON.stringify(name),
        preventAssignment: true,
      }),
      typescript({
        compilerOptions: {
          declaration: true,
          declarationDir: dir,
          outDir: dir,
        },
        exclude: ['**/*.test.ts', '**/*.spec.ts'],
      }),
      pluginResolve({
        extensions: ['.js', '.ts'],
      }),
      commonjs(),
    ],
  }
}

/** @type {() => import('rollup').RollupOptions} */
const createBrowserConfig = () => ({
  input: 'src/index.ts',
  output: {
    file: pkg.browser,
    format: 'umd',
    name: globalName,
    sourcemap: true,
  },
  plugins: [
    replace({
      __VERSION__: JSON.stringify(pkg.version),
      __LIB_NAME__: JSON.stringify(name),
      preventAssignment: true,
    }),
    typescript({
      compilerOptions: {
        // 浏览器版不需要 .d.ts，可以关闭
        declaration: false,
      },
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
    }),
    pluginResolve({
      extensions: ['.js', '.ts'],
    }),
    commonjs(),
    terser({
      compress: {
        drop_debugger: true,
      },
      format: {
        comments: false, // 移除所有注释
      },
    }),
  ],
})

export default [
  createModuleConfig('cjs', cjsDir, { clear: true }),
  createModuleConfig('esm', esmDir),
  createBrowserConfig(),
]
