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
declare const applyFormatting: (text: string) => React.ReactNode[];
declare const applyFormattingInline: (text: string) => React.ReactNode[];
export { injectHeaders, injectBold, injectBullet, injectNewlines, convertMarkdownTableToHTML, applyFormatting, applyFormattingInline, };
