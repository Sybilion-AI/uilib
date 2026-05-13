import cn from 'classnames';

import S from './Logo.styl';
import type { LogoProps } from './Logo.types';

/**
 * Public URL for the Sybilion logo in standalone apps. Copy `@sybilion/uilib/logo.svg`
 * to `public/logo.svg` (Sybilion app template README documents postinstall copies).
 * Same path as the favicon `<link href>`.
 */
export const SYBILION_STANDALONE_LOGO_PUBLIC_URL = '/logo.svg' as const;

export function Logo({
  showText = true,
  size = 'md',
  className,
  ...props
}: LogoProps) {
  return (
    <div className={cn(S.root, S[size], className)} {...props}>
      <img
        src={SYBILION_STANDALONE_LOGO_PUBLIC_URL}
        alt={showText ? '' : 'Sybilion'}
        className={S.icon}
        {...(showText ? { 'aria-hidden': true } : {})}
      />
      {showText && <span className={S.text}>Sybilion</span>}
    </div>
  );
}
