const isBrowser = typeof window !== 'undefined';
isBrowser &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.localhost'));

export { isBrowser };
