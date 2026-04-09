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
        minimize: true,
        modules: true,
        use: [
          [
            'stylus',
            {
              paths: [path.resolve(__dirname, 'src')],
            },
          ],
        ],
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
];
