import { Button } from '#uilib/components/ui/Button';
import type { ButtonProps } from '#uilib/components/ui/Button/Button.types';
import { ChevronRight } from 'lucide-react';
import S from './SidebarMenuButton.styl';
import { Slottable } from '@radix-ui/react-slot';
import { SmartTextTruncate } from '#uilib/components/ui/SmartTextTruncate/SmartTextTruncate';
import cn from 'classnames';

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

  const buttonClassName = cn(
    variant === 'default' ? S.sidebarMenuButtonCta : S.sidebarMenuButton,
    S[`size-${size}`],
    className,
  );

  if (effectiveAsChild) {
    // The consumer supplies the root element (e.g. <NavLink/>). Radix Slot
    // requires exactly one element child, so the consumer's element is wrapped
    // in <Slottable/> and icon/addon stay as siblings — Slot clones the
    // consumer's element with Button's props and injects the siblings as its
    // children. SmartTextTruncate is intentionally omitted: wrapping the
    // consumer's element would nest the rendered <a> inside a truncate
    // container and break the slot contract.
    return (
      <Button
        asChild
        variant={variant}
        size={size}
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        data-active={isActive}
        className={buttonClassName}
        {...props}
      >
        {icon}
        <Slottable>{children}</Slottable>
        {addon}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      aria-expanded={hasSubItems ? isExpanded : undefined}
      className={buttonClassName}
      {...props}
    >
      {icon}
      {label}
      {addon}
      {chevron}
    </Button>
  );
}
