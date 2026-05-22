/** Keep in sync with `ChatPrompt.styl` `INPUT_MAX_HEIGHT` / `min-height`. */
export const PROMPT_INPUT_MAX_HEIGHT_PX = 200;
export const PROMPT_INPUT_MIN_HEIGHT_PX = 40;

/** ProseMirror `view.dom` exists only after TipTap mounts `<EditorContent />`; accessing `.view` can throw earlier. */
export function chatPromptSafeEditorDom(
  editor: { readonly isDestroyed?: boolean } | null | undefined,
): HTMLElement | null {
  if (!editor || editor.isDestroyed) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dom = (editor as any).view?.dom as unknown;
    return dom instanceof HTMLElement ? dom : null;
  } catch {
    return null;
  }
}

export function chatPromptTextareaFloorPx(cs: CSSStyleDeclaration): number {
  const padY =
    (Number.parseFloat(cs.paddingTop) || 0) +
    (Number.parseFloat(cs.paddingBottom) || 0);
  const fs = Number.parseFloat(cs.fontSize) || 14;
  const linePx =
    cs.lineHeight === 'normal'
      ? fs * 1.25
      : Number.parseFloat(cs.lineHeight) || fs * 1.25;

  return Math.max(PROMPT_INPUT_MIN_HEIGHT_PX, Math.ceil(linePx + padY));
}

/** Autosizing textarea inside flex shells: empty → floor only; typed → collapse measure + clamp. */
export function syncChatPromptTextareaHeight(
  el: HTMLTextAreaElement,
  message: string,
): void {
  const floor = chatPromptTextareaFloorPx(getComputedStyle(el));

  el.style.overflowY = 'hidden';

  let contentHeight: number;
  if (message === '') {
    contentHeight = floor;
  } else {
    el.style.height = '0';
    contentHeight = el.scrollHeight;
  }

  const h = Math.min(
    Math.max(contentHeight, floor),
    PROMPT_INPUT_MAX_HEIGHT_PX,
  );

  el.style.height = `${h}px`;
  el.style.overflowY =
    contentHeight > PROMPT_INPUT_MAX_HEIGHT_PX ? 'auto' : 'hidden';
}

/** Same sizing rules for TipTap `.ProseMirror` root (`text` mirrors doc plain text length for empty-state). */
export function syncChatPromptComposerHeight(
  el: HTMLElement,
  text: string,
): void {
  const floor = chatPromptTextareaFloorPx(getComputedStyle(el));

  el.style.overflowY = 'hidden';
  let contentHeight: number;

  const empty = text.trim() === '';

  if (empty) {
    contentHeight = floor;
  } else {
    el.style.height = '0';
    contentHeight = el.scrollHeight;
  }

  const h = Math.min(
    Math.max(contentHeight, floor),
    PROMPT_INPUT_MAX_HEIGHT_PX,
  );

  el.style.height = `${h}px`;
  el.style.overflowY =
    contentHeight > PROMPT_INPUT_MAX_HEIGHT_PX ? 'auto' : 'hidden';
}
