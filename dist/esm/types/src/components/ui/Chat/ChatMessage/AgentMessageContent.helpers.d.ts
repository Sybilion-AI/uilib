import React from 'react';
declare const injectHeaders: (content: string) => {
    elem: import("react/jsx-runtime").JSX.Element;
    index: number;
    length: number;
};
declare const injectBold: (content: string) => {
    elem: import("react/jsx-runtime").JSX.Element;
    index: number;
    length: number;
};
/** `_italic_` (underscore) — avoids clashing with `* ` bullet markers. */
declare const injectItalic: (content: string) => {
    elem: import("react/jsx-runtime").JSX.Element;
    index: number;
    length: number;
};
declare const injectBullet: (content: string) => {
    elem: import("react/jsx-runtime").JSX.Element;
    index: number;
    length: number;
};
declare const injectNewlines: (content: string) => {
    elem: import("react/jsx-runtime").JSX.Element;
    index: number;
    length: number;
};
declare const convertMarkdownTableToHTML: (text: string) => string;
type Injector = (content: string) => {
    elem: React.ReactNode;
    index: number;
    length: number;
} | null;
declare const injectAnchor: Injector;
declare const applyFormatting: (text: string) => React.ReactNode[];
declare const applyFormattingInline: (text: string) => React.ReactNode[];
export { injectHeaders, injectAnchor, injectBold, injectItalic, injectBullet, injectNewlines, convertMarkdownTableToHTML, applyFormatting, applyFormattingInline, };
