declare const VERSION: string;
/** Base URL path for docs Router (empty at site root; e.g. `/uilib` on GitHub Pages project site). */
declare const DOCS_ROUTER_BASENAME: string;

declare module '*.png';
declare module '*.json';

declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  const SVG: FC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.styl' {
  const content: { [className: string]: string };
  export default content;
}
