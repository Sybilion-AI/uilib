function getPayloadConfigFromPayload(config, payload, key) {
    if (typeof payload !== 'object' || payload === null) {
        return config[key];
    }
    // Simple direct lookup first
    return config[key] || undefined;
}

export { getPayloadConfigFromPayload };
