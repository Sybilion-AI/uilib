import cn from 'classnames';

import { Button } from '#uilib/components/ui/Button';
import { InfoIcon, XIcon } from 'lucide-react';

import S from './Banner.styl';
import type { BannerProps } from './Banner.types';

export function Banner({
  children,
  className,
  icon: Icon = InfoIcon,
  onClose,
}: BannerProps) {
  return (
    <div className={cn(S.root, className)} data-slot="banner">
      {Icon !== false && <Icon className={S.icon} size={16} />}
      {children}
      {onClose && (
        <Button
          variant="ghost"
          icon
          type="button"
          onClick={onClose}
          className={S.closeButton}
        >
          <XIcon size={16} />
        </Button>
      )}
    </div>
  );
}
