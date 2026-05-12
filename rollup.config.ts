import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import cssnano from 'cssnano';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';
import postcssPresetEnv from 'postcss-preset-env';
import del from 'rollup-plugin-delete';
import externals from 'rollup-plugin-node-externals';
import postcss from 'rollup-plugin-postcss';
import { uglify } from 'rollup-plugin-uglify';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

globSync('src/**/*.styl').forEach(css => {
  const definition = `${css}.d.ts`;
  if (!fs.existsSync(definition))
    fs.writeFileSync(
      definition,
      'const mod: { [cls: string]: string }\nexport default mod\n',
    );
});

const { COMPRESS } = process.env;

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        sourcemap: Boolean(COMPRESS),
        preserveModules: true,
      },
    ],
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router',
      'react-router-dom',
      '@homecode/ui',
      '@auth0/auth0-react',
      '@sybilion/sdk',
    ],
    plugins: [
      del({ targets: './dist/*' }),
      alias({
        entries: [
          {
            find: '#uilib/',
            replacement: `${path.resolve(__dirname, 'src')}/`,
          },
        ],
      }),
      resolve({ extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'] }),
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          outDir: 'dist/esm',
          declarationDir: 'dist/esm/types',
        },
      }),
      externals({ deps: true, peerDeps: true }),
      commonjs(),
      json(),
      url({
        limit: 0,
        include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
        fileName: 'assets/[name]-[hash][extname]',
      }),
      svgr({ exportType: 'default' }),
      postcss({
        // Default inject uses an absolute path to style-inject; Rollup turns it into a relative
        // path from each output file, which breaks in consumers (e.g. design-demo). Use the
        // package name so bundlers resolve node_modules/style-inject correctly.
        inject: cssVariableName =>
          `\nimport styleInject from 'style-inject';\nstyleInject(${cssVariableName});\n`,
        // rollup-plugin-postcss with minimize:true runs its *nested* cssnano v5 after our plugins.
        // We already minify via `plugins` below with root cssnano v6 — double pass + two majors
        // broke sidebar (and other) @media rules in published dist; yarn link often masked it.
        minimize: false,
        modules: true,
        use: {
          sass: {},
          less: {},
          stylus: {
            paths: [path.resolve(__dirname, 'src')],
          },
        },
        plugins: [
          postcssPresetEnv({ stage: 3 }),
          cssnano({
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          }),
        ],
      }),
      COMPRESS && uglify(),
    ].filter(Boolean),
  },
  {
    input: 'src/standalone/vite-sybilion-standalone-dev.ts',
    output: {
      file: 'dist/standalone/vite-sybilion-standalone-dev.js',
      format: 'esm',
      sourcemap: Boolean(COMPRESS),
    },
    external: ['vite'],
    plugins: [
      resolve({ extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'] }),
      typescript({
        tsconfig: './tsconfig.standalone.json',
      }),
    ],
  },
];
