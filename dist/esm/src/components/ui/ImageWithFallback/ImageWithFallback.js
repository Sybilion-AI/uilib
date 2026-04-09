import { jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

function ImageWithFallback({ url, fallback, className, onError, ...props }) {
    const [hasError, setHasError] = useState(false);
    useEffect(() => {
        setHasError(!url?.trim());
    }, [url]);
    const handleError = (e) => {
        setHasError(true);
        onError?.(e);
    };
    if (hasError) {
        return jsx(Fragment, { children: fallback });
    }
    return (jsx("img", { src: url, className: className, onError: handleError, ...props }));
}

export { ImageWithFallback };
