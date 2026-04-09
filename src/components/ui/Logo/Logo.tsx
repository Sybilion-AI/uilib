'use client';

import cn from 'classnames';

import S from './Logo.styl';
import type { LogoProps } from './Logo.types';

export function Logo({
  showText = true,
  size = 'md',
  className,
  ...props
}: LogoProps) {
  return (
    <div className={cn(S.root, S[size], className)} {...props}>
      <img src="/logo.svg" alt="Sybilion" className={S.icon} />
      {showText && <span className={S.text}>Sybilion</span>}
    </div>
  );
}
