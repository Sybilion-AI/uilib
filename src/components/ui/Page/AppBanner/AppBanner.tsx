import { Button } from '#uilib/components/ui/Button';
import type { ReactNode } from 'react';
import S from './AppBanner.styl';
import { XIcon } from 'lucide-react';
import cn from 'classnames';

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
          icon
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
