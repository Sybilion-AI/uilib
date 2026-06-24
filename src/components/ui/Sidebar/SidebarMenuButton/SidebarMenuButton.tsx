import cn from 'classnames';

import { Button } from '#uilib/components/ui/Button';
import type { ButtonProps } from '#uilib/components/ui/Button/Button.types';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate/SmartTextTruncate';
import { ChevronRight } from 'lucide-react';

import S from './SidebarMenuButton.styl';

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  hasSubItems = false,
  isExpanded = false,
  variant = 'ghost',
  size = 'sm',
  className,
  icon,
  children,
  addon,
  ...props
}: Omit<ButtonProps, 'icon'> & {
  icon?: React.ReactNode;
  addon?: React.ReactNode;
  isActive?: boolean;
  /** When true, renders an expand/collapse chevron (requires a non–asChild button). */
  hasSubItems?: boolean;
  /** Chevron direction when `hasSubItems` is true. */
  isExpanded?: boolean;
}) {
  const effectiveAsChild = asChild && !hasSubItems;

  const label = (
    <SmartTextTruncate className={S.sidebarMenuButtonLabel}>
      {children}
    </SmartTextTruncate>
  );

  const chevron = hasSubItems ? (
    <span
      className={cn(S.sidebarMenuButtonChevron, isExpanded && S.expanded)}
      aria-hidden="true"
    >
      <ChevronRight size={16} />
    </span>
  ) : null;

  const userContent = (
    <>
      {label}
      {addon}
    </>
  );

  return (
    <Button
      asChild={effectiveAsChild}
      variant={variant}
      size={size}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      aria-expanded={hasSubItems ? isExpanded : undefined}
      className={cn(
        variant === 'default' ? S.sidebarMenuButtonCta : S.sidebarMenuButton,
        S[`size-${size}`],
        className,
      )}
      {...props}
    >
      {icon}
      {effectiveAsChild ? (
        userContent
      ) : (
        <>
          {userContent}
          {chevron}
        </>
      )}
    </Button>
  );
}
