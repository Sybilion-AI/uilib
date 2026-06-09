import cn from 'classnames';
import type { ReactNode } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { XIcon } from 'lucide-react';

import S from './AppBanner.styl';

export interface AppBannerProps {
  children?: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

export function AppBanner({ children, className, onDismiss }: AppBannerProps) {
  return (
    <div className={cn(S.root, className)} data-slot="app-banner" role="status">
      <div className={S.message}>{children}</div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onDismiss}
          className={S.dismiss}
          aria-label="Dismiss banner"
        >
          <XIcon size={16} aria-hidden />
        </Button>
      )}
    </div>
  );
}
