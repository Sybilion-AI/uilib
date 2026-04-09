declare const VERSION: string;

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
