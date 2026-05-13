import cn from 'classnames';
import type { ReactNode } from 'react';

import { Logo } from '#uilib/components/ui/Logo/Logo';
import type { LogoSize } from '#uilib/components/ui/Logo/Logo.types';

import { SybilionAuthHeadline } from './SybilionAuthHeadline';
import S from './SybilionAuthLayout.styl';

/** Same convention as {@link SYBILION_STANDALONE_LOGO_PUBLIC_URL}: copy `sybilion-bg.svg` from the package into `public/`. */
export const SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL =
  '/sybilion_bg.svg' as const;

export type SybilionAuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  logoSize?: LogoSize;
  containerClassName?: string;
  /** Public URL for the hero watermark SVG (default {@link SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL}). */
  heroBackgroundUrl?: string;
};

export function SybilionAuthLayout({
  title,
  subtitle,
  children,
  logoSize,
  containerClassName,
  heroBackgroundUrl = SYBILION_STANDALONE_AUTH_HERO_BG_PUBLIC_URL,
}: SybilionAuthLayoutProps) {
  const bg = heroBackgroundUrl
    ? `url(${JSON.stringify(heroBackgroundUrl)})`
    : 'none';

  return (
    <div className={S.root}>
      <div className={S.leftPanel}>
        <div
          className={S.bgImage}
          style={{ backgroundImage: bg }}
          aria-hidden
        />

        <div className={S.logoContainer}>
          <Logo className={S.logo} size={logoSize} />
        </div>

        <SybilionAuthHeadline />
      </div>

      <div className={S.rightPanel}>
        <div className={cn(S.formContainer, containerClassName)}>
          <div className={S.header}>
            <h1 className={S.title}>{title}</h1>
            {subtitle && <p className={S.subtitle}>{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
