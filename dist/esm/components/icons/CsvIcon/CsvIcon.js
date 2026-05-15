import { jsx } from 'react/jsx-runtime';
import CsvSvg from './csv.svg.js';

function CsvIcon({ size = 32 }) {
    return jsx(CsvSvg, { width: size, height: size, "aria-hidden": true });
}

export { CsvIcon };
