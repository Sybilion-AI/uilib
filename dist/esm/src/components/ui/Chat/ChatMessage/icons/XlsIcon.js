import { jsx } from 'react/jsx-runtime';
import XlsPng from './xls.png.js';

function XlsIcon({ size = 32 }) {
    return jsx("img", { src: XlsPng, width: size, height: size, alt: "XLS file" });
}

export { XlsIcon };
