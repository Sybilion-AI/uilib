import S from './InteractiveContent.styl';
type AutolinkUrlProps = {
    href: string;
    display: string;
    target?: string;
    rel?: string;
};
export declare function displayUrlForAutolink(display: string): string;
export declare function shouldRenderAutolinkPill(label: string, href: string): boolean;
export declare function AutolinkUrl({ href, display, target, rel }: AutolinkUrlProps): import("react/jsx-runtime").JSX.Element;
export { S as autolinkStyles };
