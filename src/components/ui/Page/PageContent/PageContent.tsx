import cn from 'classnames';

import S from './PageContent.styl';

export function PageContent({
  className,
  children,
  variant = 'default',
}: {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'clean';
}) {
  return (
    <div className={cn(S.root, S[`variant-${variant}`], className)}>
      {children}
    </div>
  );
}

export function PageContentSection({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(S.section, className)}>{children}</div>;
}
