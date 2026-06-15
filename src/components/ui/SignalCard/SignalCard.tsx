import cn from 'classnames';

import { Kicker } from '../Kicker';
import S from './SignalCard.styl';
import { SignalCardProps } from './SignalCard.types';

function SignalCard({
  className,
  kicker,
  icon,
  title,
  subtitle,
  value,
  unit,
  tolerance,
  description,
  delta,
  meta,
  sparkline,
  children,
  ...props
}: SignalCardProps) {
  const hasHead = icon != null || title != null || subtitle != null;
  const hasFooter = delta != null || (meta?.length ?? 0) > 0;

  return (
    <div data-slot="signal-card" className={cn(S.root, className)} {...props}>
      {kicker != null && <Kicker>{kicker}</Kicker>}
      {hasHead && (
        <div className={S.head}>
          {icon != null && <div className={S.badge}>{icon}</div>}
          <div className={S.headText}>
            {title != null && <div className={S.title}>{title}</div>}
            {subtitle != null && <div className={S.subtitle}>{subtitle}</div>}
          </div>
        </div>
      )}
      {value != null && (
        <div className={S.figure}>
          <span className={S.value}>{value}</span>
          {unit != null && <span className={S.unit}>{unit}</span>}
          {tolerance != null && (
            <span className={S.tolerance}>{tolerance}</span>
          )}
        </div>
      )}
      {description != null && <div className={S.body}>{description}</div>}
      {sparkline != null && <div className={S.sparkline}>{sparkline}</div>}
      {children}
      {hasFooter && (
        <div className={S.foot}>
          {delta}
          {meta?.map((item, index) => (
            <span key={index} className={S.dim}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { SignalCard };
