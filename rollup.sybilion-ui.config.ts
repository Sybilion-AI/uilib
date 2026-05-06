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

const SYB_PKG_JSON = path.resolve(
  __dirname,
  'packages/sybilion-ui/package.json',
);
const { COMPRESS } = process.env;

export default [
  {
    input: 'packages/sybilion-ui/src/index.ts',
    output: [
      {
        dir: 'packages/sybilion-ui/dist/esm',
        format: 'esm',
        sourcemap: Boolean(COMPRESS),
        preserveModules: true,
        preserveModulesRoot: path.resolve(__dirname),
      },
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      del({ targets: 'packages/sybilion-ui/dist/*' }),
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
        tsconfig: './tsconfig.sybilion-ui.json',
        compilerOptions: {
          declaration: false,
          declarationMap: false,
        },
      }),
      externals({
        deps: true,
        peerDeps: true,
        packagePath: SYB_PKG_JSON,
      }),
      commonjs(),
      json(),
      url({
        limit: 0,
        include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
        fileName: 'assets/[name]-[hash][extname]',
      }),
      svgr({ exportType: 'default' }),
      postcss({
        inject: cssVariableName =>
          `\nimport styleInject from 'style-inject';\nstyleInject(${cssVariableName});\n`,
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
];
