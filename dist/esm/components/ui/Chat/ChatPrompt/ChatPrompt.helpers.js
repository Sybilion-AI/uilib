/** Keep in sync with `ChatPrompt.styl` `INPUT_MAX_HEIGHT` / `min-height`. */
const PROMPT_INPUT_MAX_HEIGHT_PX = 200;
const PROMPT_INPUT_MIN_HEIGHT_PX = 40;
/** ProseMirror `view.dom` exists only after TipTap mounts `<EditorContent />`; accessing `.view` can throw earlier. */
function chatPromptSafeEditorDom(editor) {
    if (!editor || editor.isDestroyed)
        return null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dom = editor.view?.dom;
        return dom instanceof HTMLElement ? dom : null;
    }
    catch {
        return null;
    }
}
function chatPromptTextareaFloorPx(cs) {
    const padY = (Number.parseFloat(cs.paddingTop) || 0) +
        (Number.parseFloat(cs.paddingBottom) || 0);
    const fs = Number.parseFloat(cs.fontSize) || 14;
    const linePx = cs.lineHeight === 'normal'
        ? fs * 1.25
        : Number.parseFloat(cs.lineHeight) || fs * 1.25;
    return Math.max(PROMPT_INPUT_MIN_HEIGHT_PX, Math.ceil(linePx + padY));
}
/** Same sizing rules for TipTap `.ProseMirror` root (`text` mirrors doc plain text length for empty-state). */
function syncChatPromptComposerHeight(el, text) {
    const floor = chatPromptTextareaFloorPx(getComputedStyle(el));
    el.style.overflowY = 'hidden';
    let contentHeight;
    const empty = text.trim() === '';
    if (empty) {
        contentHeight = floor;
    }
    else {
        el.style.height = '0';
        contentHeight = el.scrollHeight;
    }
    const h = Math.min(Math.max(contentHeight, floor), PROMPT_INPUT_MAX_HEIGHT_PX);
    el.style.height = `${h}px`;
    el.style.overflowY =
        contentHeight > PROMPT_INPUT_MAX_HEIGHT_PX ? 'auto' : 'hidden';
}

export { PROMPT_INPUT_MAX_HEIGHT_PX, PROMPT_INPUT_MIN_HEIGHT_PX, chatPromptSafeEditorDom, chatPromptTextareaFloorPx, syncChatPromptComposerHeight };
