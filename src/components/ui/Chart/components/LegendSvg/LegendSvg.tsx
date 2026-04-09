export interface LegendSvgPayloadItem {
  value: string;
  color: string;
  dataKey: string;
}

interface LegendSvgProps {
  payload: LegendSvgPayloadItem[];
  width: number;
  marginLeft?: number;
}

const ITEM_GAP = 12;
const ICON_WIDTH = 18;
const FONT_SIZE = 16;
const ROW_HEIGHT = 24;

export function LegendSvg({ payload, width, marginLeft = 0 }: LegendSvgProps) {
  if (payload.length === 0) return null;

  let x = marginLeft;
  const items: { x: number; item: LegendSvgPayloadItem }[] = [];

  payload.forEach(item => {
    items.push({ x, item });
    x += ICON_WIDTH + ITEM_GAP + item.value.length * FONT_SIZE * 0.6 + ITEM_GAP;
  });

  return (
    <svg
      width={width}
      height={ROW_HEIGHT}
      viewBox={`0 0 ${Math.max(width, x)} ${ROW_HEIGHT}`}
      style={{ display: 'block' }}
    >
      {items.map(({ x: itemX, item }) => (
        <g key={item.dataKey} transform={`translate(${itemX}, 0)`}>
          <line
            x1={0}
            y1={ROW_HEIGHT / 2}
            x2={ICON_WIDTH}
            y2={ROW_HEIGHT / 2}
            stroke={item.color}
            strokeWidth={2}
            strokeDasharray="3 3"
          />
          <circle cx={20} cy={ROW_HEIGHT / 2} r={3} fill={item.color} />
          <text
            x={ICON_WIDTH + ITEM_GAP}
            y={ROW_HEIGHT / 2}
            dy="0.35em"
            fontSize={FONT_SIZE}
            fill="#333333"
          >
            {item.value}
          </text>
        </g>
      ))}
    </svg>
  );
}
