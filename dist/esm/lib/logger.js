const isProduction = process.env.NODE_ENV === 'production';
var logger = isProduction
    ? {
        log: () => { },
        warn: () => { },
        error: console.error,
    }
    : console;

export { logger as default };
