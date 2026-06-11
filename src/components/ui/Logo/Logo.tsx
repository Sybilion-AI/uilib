import LogoMarkSvg from './logo.svg';
import type { LogoProps } from './Logo.types';
import S from './Logo.styl';
import cn from 'classnames';

export { LogoMarkSvg as LogoMark };

/**
 * Public URL for standalone apps. Copy `@sybilion/uilib/logo.svg` (Logo component asset)
 * to `public/logo.svg` (app template README documents postinstall copies).
 * Same path as the favicon `<link href>`.
 */
export const SYBILION_STANDALONE_LOGO_PUBLIC_URL = '/logo.svg' as const;

export function Logo({
  showText = true,
  brandText = 'Sybilion',
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
      {showText && <span className={S.text}>{brandText}</span>}
    </div>
  );
}
