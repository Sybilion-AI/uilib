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
  ...rest
}: {
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<'div'>, 'className' | 'children'>) {
  return (
    <div className={cn(S.section, className)} {...rest}>
      {children}
    </div>
  );
}
