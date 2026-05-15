import { jsx } from 'react/jsx-runtime';
import S from './MapBackground.styl.js';
import mapBgUrl from './map.svg.js';

function MapBackground() {
    const src = mapBgUrl;
    return (jsx("img", { alt: "", className: S.mapBackground, decoding: "async", draggable: false, src: src }));
}

export { MapBackground };
