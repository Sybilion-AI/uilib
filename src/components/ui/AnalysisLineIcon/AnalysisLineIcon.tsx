import S from './AnalysisLineIcon.styl';

export type AnalysisLineIconVariant = 'dashed' | 'solid';

export interface AnalysisLineIconProps {
  color?: string;
  variant: AnalysisLineIconVariant;
}

function DashedLine({ color }: { color: string }) {
  return (
    <svg
      className={S.line}
      width={18}
      height={2}
      viewBox="0 0 18 2"
      fill="currentColor"
      style={{ color }}
    >
      <line
        x1={0}
        y1={1}
        x2={18}
        y2={1}
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="3 3"
      />
    </svg>
  );
}

export function AnalysisLineIcon({
  color = 'var(--foreground)',
  variant,
}: AnalysisLineIconProps) {
  return (
    <div className={S.lineIcon}>
      {variant === 'dashed' ? (
        <DashedLine color={color} />
      ) : (
        <div className={S.line} style={{ backgroundColor: color }} />
      )}
      <div className={S.dot} style={{ backgroundColor: color }} />
    </div>
  );
}
