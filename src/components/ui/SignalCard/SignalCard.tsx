import cn from 'classnames';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../Card';
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
  const hasContent =
    value != null ||
    description != null ||
    sparkline != null ||
    children != null;

  return (
    <Card
      data-slot="signal-card"
      paddingSize="s"
      className={cn(S.root, className)}
      {...props}
    >
      {kicker != null && <Kicker>{kicker}</Kicker>}
      {hasHead && (
        <CardHeader
          className={S.head}
          icon={icon}
          iconWithBackground
          title={title}
          titleClassName={S.title}
          description={subtitle}
          descriptionClassName={S.subtitle}
          textsClassName={S.headText}
        />
      )}
      {hasContent && (
        <CardContent noScroll className={S.content}>
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
        </CardContent>
      )}
      {hasFooter && (
        <CardFooter className={S.foot}>
          {delta}
          {meta?.map((item, index) => (
            <span key={index} className={S.dim}>
              {item}
            </span>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

export { SignalCard };
