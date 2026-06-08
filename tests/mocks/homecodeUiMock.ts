const LS = {
  get(key: string) {
    const raw = window.localStorage.getItem(key);
    if (!raw) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },
  set(key: string, val: unknown) {
    if (val === undefined || val === null) {
      window.localStorage.removeItem(key);
      return;
    }
    const item = typeof val === 'object' ? JSON.stringify(val) : String(val);
    window.localStorage.setItem(key, item);
  },
  remove(key: string) {
    window.localStorage.removeItem(key);
  },
};

export { LS };
