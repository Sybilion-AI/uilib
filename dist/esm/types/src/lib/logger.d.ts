declare const _default: Console | {
    log: () => void;
    warn: () => void;
    error: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
};
export default _default;
