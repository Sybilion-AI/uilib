import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect } from 'react';
import S from './Image.styl.js';

function Image({ url, fallback, className, ...props }) {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setIsLoading(true);
    }, [url]);
    const handleLoad = () => {
        setIsLoading(false);
    };
    return (jsxs("div", { className: S.container, children: [isLoading && jsx("div", { className: S.fallback, children: fallback }), jsx("img", { src: url, className: cn(S.image, isLoading && S.loading, className), onLoad: handleLoad, ...props })] }));
}

export { Image };
