import cn from 'classnames';
import { useState } from 'react';

import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';

import S from './Foldable.styl';
import type { FoldableProps } from './Foldable.types';

export function Foldable({
  header,
  content,
  contentClassName,
  defaultUnfolded = false,
}: FoldableProps) {
  const [isUnfolded, setIsUnfolded] = useState(defaultUnfolded);

  const toggleFold = () => {
    setIsUnfolded(prev => !prev);
  };

  return (
    <div className={cn(S.root, isUnfolded && S.unfolded)}>
      <div className={S.header} onClick={toggleFold}>
        <div className={S.headerContent}>{header}</div>
        <div className={S.toggle}>
          {isUnfolded ? (
            <CaretUpIcon size={20} className={S.icon} />
          ) : (
            <CaretDownIcon size={20} className={S.icon} />
          )}
        </div>
      </div>
      {isUnfolded && (
        <div className={cn(S.content, contentClassName)}>{content}</div>
      )}
    </div>
  );
}
