import alias from '@rollup/plugin-alias';
import path from 'path';
import dts from 'rollup-plugin-dts';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: 'packages/sybilion-ui/src/index.ts',
  output: {
    file: 'packages/sybilion-ui/dist/sybilion-ui.d.ts',
    format: 'es',
  },
  plugins: [
    alias({
      entries: [
        {
          find: '#uilib/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
    }),
    dts({
      tsconfig: './tsconfig.sybilion-ui.json',
    }),
  ],
};
