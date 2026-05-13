import cn from 'classnames';
import type { ReactNode } from 'react';

import { Logo } from '#uilib/components/ui/Logo/Logo';
import type { LogoSize } from '#uilib/components/ui/Logo/Logo.types';

import { SybilionAuthHeadline } from './SybilionAuthHeadline';
import S from './SybilionAuthLayout.styl';

export type SybilionAuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  logoSize?: LogoSize;
  containerClassName?: string;
  style?: React.CSSProperties;
};

export function SybilionAuthLayout({
  title,
  subtitle,
  children,
  logoSize,
  containerClassName,
  style,
}: SybilionAuthLayoutProps) {
  return (
    <div className={S.root} style={style}>
      <div className={S.leftPanel}>
        <Logo showText={false} className={S.heroWatermark} aria-hidden />

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
