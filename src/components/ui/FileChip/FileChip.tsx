import cn from 'classnames';

import { CsvIcon } from '#uilib/components/icons/CsvIcon/CsvIcon';
import { CardAction, CardHeader } from '#uilib/components/ui/Card';
import { FileTextIcon, XIcon } from '@phosphor-icons/react';

import S from './FileChip.styl';
import type { FileChipFormat, FileChipProps } from './FileChip.types';

const FORMAT_ICON_SIZE = 32;

function FormatIcon({ format }: { format: FileChipFormat }) {
  if (format === 'csv') {
    return <CsvIcon size={FORMAT_ICON_SIZE} />;
  }

  return (
    <FileTextIcon
      size={FORMAT_ICON_SIZE}
      aria-hidden
      style={{ color: 'var(--muted-foreground)' }}
    />
  );
}

function FileChipHeader({
  name,
  format,
  hint,
  icon,
  onRemove,
}: Pick<
  FileChipProps,
  'name' | 'format' | 'hint' | 'icon' | 'onRemove' | 'disabled'
>) {
  return (
    <CardHeader
      className={S.header}
      icon={icon ?? <FormatIcon format={format} />}
      title={name}
      description={hint}
      titleClassName={S.title}
      descriptionClassName={S.hint}
      tooltipProps={{ maxWidth: 400 }}
    >
      {onRemove ? (
        <CardAction>
          <button
            type="button"
            className={S.remove}
            aria-label={`Remove ${name}`}
            onClick={onRemove}
          >
            <XIcon size={14} aria-hidden />
          </button>
        </CardAction>
      ) : null}
    </CardHeader>
  );
}

export function FileChip({
  name,
  format,
  hint,
  icon,
  onClick,
  onRemove,
  className,
}: FileChipProps) {
  const header = (
    <FileChipHeader
      name={name}
      format={format}
      hint={hint}
      icon={icon}
      onRemove={onRemove}
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(S.root, S.interactive, className)}
        aria-label={`${hint}: ${name}`}
        onClick={onClick}
      >
        {header}
      </button>
    );
  }

  return (
    <div className={cn(S.root, className)} role="group">
      {header}
    </div>
  );
}
