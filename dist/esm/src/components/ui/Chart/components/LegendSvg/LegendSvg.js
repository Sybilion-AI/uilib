import { jsx, jsxs } from 'react/jsx-runtime';

const ITEM_GAP = 12;
const ICON_WIDTH = 18;
const FONT_SIZE = 16;
const ROW_HEIGHT = 24;
function LegendSvg({ payload, width, marginLeft = 0 }) {
    if (payload.length === 0)
        return null;
    let x = marginLeft;
    const items = [];
    payload.forEach(item => {
        items.push({ x, item });
        x += ICON_WIDTH + ITEM_GAP + item.value.length * FONT_SIZE * 0.6 + ITEM_GAP;
    });
    return (jsx("svg", { width: width, height: ROW_HEIGHT, viewBox: `0 0 ${Math.max(width, x)} ${ROW_HEIGHT}`, style: { display: 'block' }, children: items.map(({ x: itemX, item }) => (jsxs("g", { transform: `translate(${itemX}, 0)`, children: [jsx("line", { x1: 0, y1: ROW_HEIGHT / 2, x2: ICON_WIDTH, y2: ROW_HEIGHT / 2, stroke: item.color, strokeWidth: 2, strokeDasharray: "3 3" }), jsx("circle", { cx: 20, cy: ROW_HEIGHT / 2, r: 3, fill: item.color }), jsx("text", { x: ICON_WIDTH + ITEM_GAP, y: ROW_HEIGHT / 2, dy: "0.35em", fontSize: FONT_SIZE, fill: "#333333", children: item.value })] }, item.dataKey))) }));
}

export { LegendSvg };
