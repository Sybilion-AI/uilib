const transformDataForChart = (data) => {
    return data.map((value, index) => ({
        index,
        value,
    }));
};
const getStrokeColor = (strokeColor) => {
    return strokeColor || 'hsl(var(--foreground))';
};

export { getStrokeColor, transformDataForChart };
