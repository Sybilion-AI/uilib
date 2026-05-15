import cn from 'classnames';
import { ReactNode } from 'react';

import S from './ChartEmptyState.styl';

export type ChartEmptyStatusTone = 'muted' | 'destructive';

export interface ChartEmptyStateProps {
  className?: string;
  /** Primary guidance (muted). */
  hint?: ReactNode;
  /** Status / technical detail. */
  status?: ReactNode;
  statusTone?: ChartEmptyStatusTone;
  /** `panel`: chart-sized block with light fill. `inline`: text only (e.g. above chart). */
  variant?: 'panel' | 'inline';
  align?: 'center' | 'start';
}

function isNonEmpty(node: ReactNode): boolean {
  if (node == null || node === false) return false;
  if (typeof node === 'string') return node.trim().length > 0;
  return true;
}

export function ChartEmptyState({
  className,
  hint,
  status,
  statusTone = 'muted',
  variant = 'panel',
  align = 'center',
}: ChartEmptyStateProps) {
  const hasHint = isNonEmpty(hint);
  const hasStatus = isNonEmpty(status);

  if (!hasHint && !hasStatus) {
    return null;
  }

  return (
    <div
      className={cn(
        S.root,
        variant === 'panel' && S.rootPanel,
        variant === 'inline' && S.rootInline,
        align === 'start' && S.rootAlignStart,
        align === 'center' && S.rootAlignCenter,
        className,
      )}
    >
      {hasHint && <div className={S.hint}>{hint}</div>}
      {hasStatus && (
        <div
          className={cn(
            S.status,
            statusTone === 'destructive' && S.statusDestructive,
            statusTone === 'muted' && S.statusMuted,
          )}
        >
          {status}
        </div>
      )}
    </div>
  );
}
