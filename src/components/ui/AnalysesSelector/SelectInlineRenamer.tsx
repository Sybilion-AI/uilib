import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Input } from '#uilib/components/ui/Input';
import { TextShimmer } from '#uilib/components/ui/TextShimmer/TextShimmer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';
import { PencilSimpleIcon } from '@phosphor-icons/react';

import S from './AnalysesSelector.styl';

const LABEL_MAX = 64;
const MANUALLY_ADJUSTED_NAME = 'Manually adjusted';
const MANUALLY_ADJUSTED_RENAME_MAX =
  LABEL_MAX - MANUALLY_ADJUSTED_NAME.length;

type SelectInlineRenamerProps = {
  value: string;
  /** Shown in trigger when not editing; defaults to `value`. */
  displayLabel?: string;
  onChange: (value: string) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  isRenaming: boolean;
  onEnterRenaming: () => void;
};

const stopSelectBubble = (e: React.SyntheticEvent) => {
  e.stopPropagation();
};

const stopSelectOpen = (e: React.SyntheticEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const stopRenamerKeyboardBubble = (e: React.KeyboardEvent) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};

export function SelectInlineRenamer({
  value,
  displayLabel,
  onChange,
  onEnterRenaming,
  disabled,
  className,
  isRenaming,
}: SelectInlineRenamerProps) {
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isSaving) {
      setDraft(value);
    }
  }, [value, isSaving]);

  const exitRenaming = useCallback(() => {
    if (isRenaming) {
      onEnterRenaming();
    }
  }, [isRenaming, onEnterRenaming]);

  const persistRename = useCallback(
    async (trimmed: string) => {
      setIsSaving(true);
      setDraft(trimmed);
      exitRenaming();
      try {
        await onChange(trimmed);
      } catch {
        setDraft(value);
      } finally {
        setIsSaving(false);
      }
    },
    [exitRenaming, onChange, value],
  );

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      void persistRename(trimmed);
      return;
    }
    exitRenaming();
    setDraft(value);
  }, [draft, exitRenaming, persistRename, value]);

  const cancel = useCallback(() => {
    exitRenaming();
    setDraft(value);
  }, [exitRenaming, value]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      stopRenamerKeyboardBubble(e);

      if (e.key === 'Enter' && draft.trim()) {
        e.preventDefault();
        const trimmed = draft.trim();
        if (trimmed !== value) {
          void persistRename(trimmed);
          return;
        }
        exitRenaming();
        setDraft(trimmed);
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    },
    [cancel, draft, exitRenaming, persistRename, value],
  );

  const onKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== ' ') return;

    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDraftChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(e.target.value.slice(0, MANUALLY_ADJUSTED_RENAME_MAX));
    },
    [],
  );

  if (isRenaming) {
    return (
      <Input
        className={cn(S.selectInlineRenamerInput, className)}
        autoFocus
        variant="clean"
        size="sm"
        value={draft}
        maxLength={MANUALLY_ADJUSTED_RENAME_MAX}
        onChange={onDraftChange}
        onBlur={commit}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={stopSelectBubble}
        onClick={stopSelectBubble}
      />
    );
  }

  const triggerLabel = isSaving ? draft : (displayLabel ?? value);

  return (
    <div className={cn(S.selectInlineRenamer, className)}>
      {isSaving ? (
        <TextShimmer as="span" className={S.label}>
          {triggerLabel}
        </TextShimmer>
      ) : (
        <span className={S.label}>{triggerLabel}</span>
      )}
      {!disabled && !isSaving && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className={S.renamerEditButton}
              onPointerDown={stopSelectOpen}
              onClick={e => {
                e.stopPropagation();
                setDraft(value);
                onEnterRenaming();
              }}
            >
              <PencilSimpleIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Rename</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
