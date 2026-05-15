/** Keep in sync with `ChatPrompt.styl` `INPUT_MAX_HEIGHT` / `min-height`. */
const PROMPT_INPUT_MAX_HEIGHT_PX = 200;
const PROMPT_INPUT_MIN_HEIGHT_PX = 40;
function chatPromptTextareaFloorPx(cs) {
    const padY = (Number.parseFloat(cs.paddingTop) || 0) +
        (Number.parseFloat(cs.paddingBottom) || 0);
    const fs = Number.parseFloat(cs.fontSize) || 14;
    const linePx = cs.lineHeight === 'normal'
        ? fs * 1.25
        : Number.parseFloat(cs.lineHeight) || fs * 1.25;
    return Math.max(PROMPT_INPUT_MIN_HEIGHT_PX, Math.ceil(linePx + padY));
}
/** Autosizing textarea inside flex shells: empty → floor only; typed → collapse measure + clamp. */
function syncChatPromptTextareaHeight(el, message) {
    const floor = chatPromptTextareaFloorPx(getComputedStyle(el));
    el.style.overflowY = 'hidden';
    let contentHeight;
    if (message === '') {
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

export { PROMPT_INPUT_MAX_HEIGHT_PX, PROMPT_INPUT_MIN_HEIGHT_PX, chatPromptTextareaFloorPx, syncChatPromptTextareaHeight };
