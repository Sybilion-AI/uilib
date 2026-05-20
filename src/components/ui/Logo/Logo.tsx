import cn from 'classnames';

import S from './Logo.styl';
import type { LogoProps } from './Logo.types';
import LogoMarkSvg from './logo.svg';

export { LogoMarkSvg as LogoMark };

/**
 * Public URL for standalone apps. Copy `@sybilion/uilib/logo.svg` (Logo component asset)
 * to `public/logo.svg` (app template README documents postinstall copies).
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
      <LogoMarkSvg
        className={S.icon}
        {...(showText
          ? { 'aria-hidden': true }
          : { 'aria-label': 'Sybilion', role: 'img' })}
      />
      {showText && <span className={S.text}>Sybilion</span>}
    </div>
  );
}
