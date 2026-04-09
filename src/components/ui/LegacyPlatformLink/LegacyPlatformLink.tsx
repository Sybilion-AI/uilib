import S from './LegacyPlatformLink.styl';
import type { LegacyPlatformLinkProps } from './LegacyPlatformLink.types';

export function LegacyPlatformLink({
  redirectPath,
  children,
  className,
  ...props
}: LegacyPlatformLinkProps) {
  const apiDomain = 'https://api.sybilion.com';
  const legacyUrl = `${apiDomain}${redirectPath}`;

  return (
    <a href={legacyUrl} className={className || S.link} {...props}>
      {children}
    </a>
  );
}
