import cn from 'classnames';
import { useState } from 'react';

import { CaretRightIcon } from '@phosphor-icons/react';

import S from './Foldable.styl';
import type { FoldableProps } from './Foldable.types';

export function Foldable({
  header,
  content,
  contentClassName,
  defaultUnfolded = false,
  variant = 'default',
}: FoldableProps) {
  const [isUnfolded, setIsUnfolded] = useState(defaultUnfolded);

  const toggleFold = () => {
    setIsUnfolded(prev => !prev);
  };

  return (
    <div
      className={cn(
        S.root,
        isUnfolded && S.unfolded,
        variant === 'clear' && S.clear,
      )}
    >
      <div className={S.header} onClick={toggleFold} aria-expanded={isUnfolded}>
        <div className={S.headerContent}>{header}</div>
        <div className={S.toggle}>
          <CaretRightIcon size={20} className={S.icon} />
        </div>
      </div>
      <div
        className={cn(
          S.content,
          !isUnfolded && S.contentHidden,
          contentClassName,
        )}
      >
        {content}
      </div>
    </div>
  );
}
