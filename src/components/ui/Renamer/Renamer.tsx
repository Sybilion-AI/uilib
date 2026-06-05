import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Input } from '#uilib/components/ui/Input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';
import { useIsMobile } from '#uilib/hooks/useIsMobile';
import { PencilSimpleIcon } from '@phosphor-icons/react';

import S from './Renamer.styl';
import type { RenamerProps } from './Renamer.types';

export function Renamer({
  value = '',
  onInput,
  onChange,
  children,
  className,
  placeholder = 'Name',
  size = 'md',
  round = false,
}: RenamerProps) {
  const isMobile = useIsMobile();

  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(value);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const stopAndExit = (v: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRenaming(false);
        setName(v);
      };

      if (e.key === 'Enter' && name.trim()) {
        stopAndExit(name.trim());
        onChange(name.trim());
      }

      if (e.key === 'Escape') stopAndExit(value);
    },
    [name, onChange, value],
  );

  useEffect(() => {
    setName(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setName(newValue);
      onInput?.(newValue);
    },
    [onInput],
  );

  const handleBlur = useCallback(() => {
    if (name.trim() && name.trim() !== value) {
      onChange(name.trim());
    }
    setIsRenaming(false);
    setName(value);
  }, [name, value, onChange]);

  const handleEditClick = useCallback(() => {
    setName(value);
    setIsRenaming(true);
  }, [value]);

  const inputSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    // lg typography comes from Renamer `.size-lg`; avoid Input size-lg (text-base).
    lg: 'md' as const,
  };

  const buttonSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  };

  return (
    <div
      className={cn(S.root, S[`size-${size}`], !value && S.empty, className)}
      onKeyDown={onKeyDown}
    >
      {isRenaming ? (
        <Input
          className={S.input}
          autoFocus={!isMobile}
          variant="clean"
          size={inputSizeMap[size]}
          placeholder={placeholder}
          value={name}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
        />
      ) : (
        <>
          <span className={S.value}>{children}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={S.button}
                variant="ghost"
                onPointerDown={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={e => {
                  e.stopPropagation();
                  handleEditClick();
                }}
                size={buttonSizeMap[size]}
                type="button"
              >
                <PencilSimpleIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Rename</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}
