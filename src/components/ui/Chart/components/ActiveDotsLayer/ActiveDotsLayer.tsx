import S from './ActiveDotsLayer.styl';

interface ActiveDot {
  x: number;
  y: number;
  color: string;
}

interface ActiveDotsLayerProps {
  data: ActiveDot[];
  isDarkTheme: boolean;
}

export function ActiveDotsLayer({ data, isDarkTheme }: ActiveDotsLayerProps) {
  // if (!data.length) return null;

  return (
    <div className={S.root}>
      {data.map((dot, index) => (
        <div
          key={`active-dot-${index}`}
          className={S.dot}
          style={{
            left: `${dot.x}px`,
            top: `${dot.y}px`,
            backgroundColor: dot.color,
          }}
        />
      ))}
    </div>
  );
}
