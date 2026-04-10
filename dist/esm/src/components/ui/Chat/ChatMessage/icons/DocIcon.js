import { jsx } from 'react/jsx-runtime';
import DocPng from './doc.png.js';

function DocIcon({ size = 32 }) {
    return jsx("img", { src: DocPng, width: size, height: size, alt: "DOC file" });
}

export { DocIcon };
