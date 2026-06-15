import cn from 'classnames';

import S from './PullQuote.styl';
import { PullQuoteProps } from './PullQuote.types';

function PullQuote({
  className,
  attribution,
  attributionRole,
  children,
  ...props
}: PullQuoteProps) {
  return (
    <figure data-slot="pull-quote" className={cn(S.root, className)} {...props}>
      <blockquote className={S.body}>{children}</blockquote>
      {attribution != null && (
        <figcaption className={S.attribution}>
          {attribution}
          {attributionRole != null && (
            <span className={S.role}>
              {'\u00b7 '}
              {attributionRole}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export { PullQuote };
