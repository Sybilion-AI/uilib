import cn from 'classnames';
import * as React from 'react';
import { createPortal } from 'react-dom';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import S from './Select.styl';
import type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectProps,
  SelectScrollDownButtonProps,
  SelectScrollUpButtonProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from './Select.types';

type SearchableContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  value?: string;
  commitValue: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  setPlaceholder: (placeholder: string) => void;
  selectedLabel: string;
  registerItem: (value: string, text: string) => void;
  unregisterItem: (value: string) => void;
  highlighted: string | null;
  setHighlighted: (value: string | null) => void;
  visibleValues: string[];
  triggerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  listId: string;
};

const SearchableContext = React.createContext<SearchableContextValue | null>(
  null,
);

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return '';
}

function SearchableSelectRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  onOpenChange,
  disabled,
  children,
}: Pick<
  SelectProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'open'
  | 'onOpenChange'
  | 'disabled'
  | 'children'
>) {
  const listId = React.useId();
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [items, setItems] = React.useState<Record<string, string>>({});
  const [placeholder, setPlaceholder] = React.useState('');
  const [dirty, setDirty] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState<string | null>(null);

  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? '',
  );
  const isValueControlled = valueProp !== undefined;
  const value = isValueControlled ? valueProp : uncontrolledValue;

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? Boolean(openProp) : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const commitValue = React.useCallback(
    (next: string) => {
      if (!isValueControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isValueControlled, onValueChange],
  );

  const selectedLabel = (value && items[value]) || '';
  const [query, setQuery] = React.useState(selectedLabel);

  React.useEffect(() => {
    if (!dirty) setQuery(selectedLabel);
  }, [selectedLabel, dirty]);

  const registerItem = React.useCallback((itemValue: string, text: string) => {
    setItems(prev =>
      prev[itemValue] === text ? prev : { ...prev, [itemValue]: text },
    );
  }, []);

  const unregisterItem = React.useCallback((itemValue: string) => {
    setItems(prev => {
      if (!(itemValue in prev)) return prev;
      const next = { ...prev };
      delete next[itemValue];
      return next;
    });
  }, []);

  const filter = dirty ? query.trim().toLowerCase() : '';
  const visibleValues = React.useMemo(() => {
    const entries = Object.entries(items);
    const matched = filter
      ? entries.filter(([, text]) => text.toLowerCase().includes(filter))
      : entries;
    return matched.map(([itemValue]) => itemValue);
  }, [items, filter]);

  React.useEffect(() => {
    if (!open) return;
    setHighlighted(current =>
      current && visibleValues.includes(current)
        ? current
        : (visibleValues[0] ?? null),
    );
  }, [open, visibleValues]);

  const ctx = React.useMemo<SearchableContextValue>(
    () => ({
      open,
      setOpen,
      query,
      setQuery,
      dirty,
      setDirty,
      value,
      commitValue,
      disabled,
      placeholder,
      setPlaceholder,
      selectedLabel,
      registerItem,
      unregisterItem,
      highlighted,
      setHighlighted,
      visibleValues,
      triggerRef,
      contentRef,
      listId,
    }),
    [
      open,
      setOpen,
      query,
      dirty,
      value,
      commitValue,
      disabled,
      placeholder,
      selectedLabel,
      registerItem,
      unregisterItem,
      highlighted,
      visibleValues,
      listId,
    ],
  );

  return (
    <SearchableContext.Provider value={ctx}>
      {children}
    </SearchableContext.Provider>
  );
}

function Select({
  variant = 'default',
  searchable = false,
  ...props
}: SelectProps & { variant?: 'default' | 'clear' }) {
  if (searchable) {
    return (
      <SearchableSelectRoot
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        open={props.open}
        onOpenChange={props.onOpenChange}
        disabled={props.disabled}
      >
        {props.children}
      </SearchableSelectRoot>
    );
  }

  return (
    <SelectPrimitive.Root
      data-slot="select"
      data-variant={variant}
      {...props}
    />
  );
}

function SelectGroup({ ...props }: SelectGroupProps) {
  const searchable = React.useContext(SearchableContext);
  if (searchable) {
    return <div data-slot="select-group" {...props} />;
  }
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ placeholder, ...props }: SelectValueProps) {
  const searchable = React.useContext(SearchableContext);
  React.useEffect(() => {
    if (!searchable) return;
    searchable.setPlaceholder(
      typeof placeholder === 'string' ? placeholder : extractText(placeholder),
    );
  }, [searchable, placeholder]);

  if (searchable) return null;

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      placeholder={placeholder}
      {...props}
    />
  );
}

function SearchableTrigger({
  className,
  size = 'md',
  variant = 'default',
  darker = false,
  round = false,
  hideChevron = false,
  disabled: disabledProp,
  style,
  id,
}: SelectTriggerProps) {
  const ctx = React.useContext(SearchableContext);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const selectAllOnFocus = React.useRef(false);
  React.useLayoutEffect(() => {
    if (!selectAllOnFocus.current) return;
    inputRef.current?.select();
  });
  if (!ctx) return null;

  const disabled = disabledProp ?? ctx.disabled;
  const displayValue = ctx.open && ctx.dirty ? ctx.query : ctx.selectedLabel;

  const closeAndReset = () => {
    ctx.setOpen(false);
    ctx.setDirty(false);
    ctx.setQuery(ctx.selectedLabel);
  };

  const moveHighlight = (delta: number) => {
    if (ctx.visibleValues.length === 0) return;
    const current = ctx.highlighted
      ? ctx.visibleValues.indexOf(ctx.highlighted)
      : -1;
    const nextIndex =
      delta > 0
        ? Math.min(ctx.visibleValues.length - 1, current + 1)
        : Math.max(0, current < 0 ? ctx.visibleValues.length - 1 : current - 1);
    ctx.setHighlighted(ctx.visibleValues[nextIndex] ?? null);
  };

  return (
    <div
      ref={ctx.triggerRef}
      data-slot="select-trigger"
      data-size={size}
      data-variant={variant}
      data-placeholder={!displayValue || undefined}
      className={cn(
        S.selectTrigger,
        S.searchable,
        darker && S.darker,
        round && S.round,
        variant === 'clear' && S.clear,
        className,
      )}
      style={style}
    >
      <input
        ref={inputRef}
        id={id}
        className={S.selectTriggerInput}
        role="combobox"
        aria-expanded={ctx.open}
        aria-controls={ctx.listId}
        aria-autocomplete="list"
        aria-activedescendant={
          ctx.open && ctx.highlighted
            ? `${ctx.listId}-${ctx.highlighted}`
            : undefined
        }
        disabled={disabled}
        placeholder={ctx.placeholder}
        value={displayValue}
        autoComplete="off"
        onFocus={event => {
          if (disabled) return;
          ctx.setOpen(true);
          selectAllOnFocus.current = true;
          event.currentTarget.select();
          window.setTimeout(() => {
            selectAllOnFocus.current = false;
          }, 0);
        }}
        onMouseUp={event => {
          if (!selectAllOnFocus.current) return;
          selectAllOnFocus.current = false;
          event.currentTarget.select();
        }}
        onClick={() => {
          if (disabled) return;
          ctx.setOpen(true);
        }}
        onChange={event => {
          selectAllOnFocus.current = false;
          ctx.setDirty(true);
          ctx.setQuery(event.target.value);
          ctx.setOpen(true);
        }}
        onKeyDown={event => {
          if (disabled) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!ctx.open) ctx.setOpen(true);
            else moveHighlight(1);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!ctx.open) ctx.setOpen(true);
            else moveHighlight(-1);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            if (ctx.highlighted) {
              ctx.commitValue(ctx.highlighted);
              ctx.setDirty(false);
              ctx.setOpen(false);
            }
          } else if (event.key === 'Escape') {
            event.preventDefault();
            closeAndReset();
          } else if (event.key === 'Home' && ctx.open) {
            event.preventDefault();
            ctx.setHighlighted(ctx.visibleValues[0] ?? null);
          } else if (event.key === 'End' && ctx.open) {
            event.preventDefault();
            ctx.setHighlighted(
              ctx.visibleValues[ctx.visibleValues.length - 1] ?? null,
            );
          }
        }}
      />
      {!hideChevron && <ChevronDownIcon className={S.selectIcon} />}
    </div>
  );
}

function SelectTrigger({
  className,
  size = 'md',
  variant = 'default',
  darker = false,
  round = false,
  children,
  hideChevron = false,
  asChild = false,
  ...props
}: SelectTriggerProps) {
  const searchable = React.useContext(SearchableContext);
  if (searchable) {
    return (
      <>
        {children}
        <SearchableTrigger
          className={className}
          size={size}
          variant={variant}
          darker={darker}
          round={round}
          hideChevron={hideChevron}
          {...props}
        />
      </>
    );
  }

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-variant={variant}
      className={cn(
        !asChild && S.selectTrigger,
        !asChild && darker && S.darker,
        !asChild && round && S.round,
        !asChild && variant === 'clear' && S.clear,
        className,
      )}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {!hideChevron && (
            <SelectPrimitive.Icon asChild>
              <ChevronDownIcon className={S.selectIcon} />
            </SelectPrimitive.Icon>
          )}
        </>
      )}
    </SelectPrimitive.Trigger>
  );
}

function SearchableContent({ className, children }: SelectContentProps) {
  const ctx = React.useContext(SearchableContext);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

  const updateCoords = React.useCallback(() => {
    const el = ctx?.triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [ctx]);

  React.useLayoutEffect(() => {
    if (!ctx?.open) return;
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [ctx?.open, updateCoords]);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ctx.triggerRef.current?.contains(target)) return;
      if (ctx.contentRef.current?.contains(target)) return;
      ctx.setOpen(false);
      ctx.setDirty(false);
      ctx.setQuery(ctx.selectedLabel);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ctx]);

  if (!ctx) return null;

  return createPortal(
    <div
      ref={ctx.contentRef}
      id={ctx.listId}
      role="listbox"
      data-slot="select-content"
      data-state={ctx.open ? 'open' : 'closed'}
      hidden={!ctx.open}
      aria-hidden={!ctx.open}
      className={cn(S.selectContent, S.selectContentPopper, className)}
      style={
        ctx.open
          ? {
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
              zIndex: 1100,
            }
          : { display: 'none' }
      }
    >
      <div className={S.selectViewport}>
        {children}
        {ctx.visibleValues.length === 0 && (
          <div className={S.selectEmpty}>No results</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) {
  const searchable = React.useContext(SearchableContext);
  if (searchable) {
    return (
      <SearchableContent className={className} {...props}>
        {children}
      </SearchableContent>
    );
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          S.selectContent,
          position === 'popper' && S.selectContentPopper,
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            S.selectViewport,
            position === 'popper' && S.selectViewportPopper,
            className,
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  selected,
  value,
  disabled,
  textValue,
  ...props
}: SelectItemProps) {
  const searchable = React.useContext(SearchableContext);
  const text = textValue || extractText(children);
  const registerItem = searchable?.registerItem;
  const unregisterItem = searchable?.unregisterItem;

  React.useEffect(() => {
    if (!registerItem || !unregisterItem) return;
    registerItem(value, text);
    return () => unregisterItem(value);
  }, [registerItem, unregisterItem, value, text]);

  if (searchable) {
    const visible = searchable.visibleValues.includes(value);
    if (!visible) return null;
    const isHighlighted = searchable.highlighted === value;
    const isSelected = selected || searchable.value === value;
    return (
      <div
        {...props}
        id={`${searchable.listId}-${value}`}
        role="option"
        data-slot="select-item"
        data-highlighted={isHighlighted || undefined}
        aria-selected={isSelected}
        aria-disabled={disabled || undefined}
        className={cn(S.selectItem, className, isSelected && S.selected)}
        onPointerDown={event => {
          event.preventDefault();
          if (disabled) return;
          searchable.commitValue(value);
          searchable.setDirty(false);
          searchable.setOpen(false);
        }}
        onMouseEnter={() => {
          if (!disabled) searchable.setHighlighted(value);
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(S.selectItem, className, selected && S.selected)}
      value={value}
      disabled={disabled}
      textValue={textValue}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  const searchable = React.useContext(SearchableContext);
  if (searchable) {
    return (
      <div
        data-slot="select-separator"
        className={cn(S.selectSeparator, className)}
        {...props}
      />
    );
  }
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(S.selectSeparator, className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(S.selectScrollButton, className)}
      {...props}
    >
      <ChevronUpIcon className={S.selectScrollIcon} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(S.selectScrollButton, className)}
      {...props}
    >
      <ChevronDownIcon className={S.selectScrollIcon} />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
