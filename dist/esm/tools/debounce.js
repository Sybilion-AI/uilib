function debounce(fn, ms, options) {
    const leading = options?.leading ?? true;
    if (!leading) {
        let timeoutId;
        function debouncedTrailing(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fn.apply(this, args);
                timeoutId = undefined;
            }, ms);
        }
        debouncedTrailing.cancel = () => {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        };
        return debouncedTrailing;
    }
    let timeoutId;
    let needCall = true;
    function debouncedLeading(...args) {
        const call = () => fn.apply(this, args);
        clearTimeout(timeoutId);
        if (needCall) {
            call();
            needCall = false;
        }
        timeoutId = setTimeout(() => {
            if (needCall)
                call();
            needCall = true;
        }, ms);
    }
    debouncedLeading.cancel = () => {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        needCall = true;
    };
    return debouncedLeading;
}

export { debounce as default };
