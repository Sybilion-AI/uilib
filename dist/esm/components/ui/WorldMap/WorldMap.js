import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './WorldMap.styl.js';
import mapBgUrl from './map.svg.js';

function WorldMap({ className }) {
    const src = mapBgUrl;
    return (jsx("img", { alt: "", className: cn(S.worldMap, className), decoding: "async", draggable: false, src: src }));
}

export { WorldMap };
