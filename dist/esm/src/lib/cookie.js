function getCookie(name) {
    if (typeof document === 'undefined')
        return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        let val = parts.pop()?.split(';').shift();
        try {
            val = JSON.parse(val);
        }
        catch (e) { }
        return val;
    }
    return null;
}
function setCookie(name, value, maxAge) {
    if (typeof document === 'undefined')
        return;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

export { getCookie, setCookie };
