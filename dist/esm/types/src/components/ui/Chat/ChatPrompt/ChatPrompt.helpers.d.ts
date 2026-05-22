/** Keep in sync with `ChatPrompt.styl` `INPUT_MAX_HEIGHT` / `min-height`. */
export declare const PROMPT_INPUT_MAX_HEIGHT_PX = 200;
export declare const PROMPT_INPUT_MIN_HEIGHT_PX = 40;
/** ProseMirror `view.dom` exists only after TipTap mounts `<EditorContent />`; accessing `.view` can throw earlier. */
export declare function chatPromptSafeEditorDom(editor: {
    readonly isDestroyed?: boolean;
} | null | undefined): HTMLElement | null;
export declare function chatPromptTextareaFloorPx(cs: CSSStyleDeclaration): number;
/** Autosizing textarea inside flex shells: empty → floor only; typed → collapse measure + clamp. */
export declare function syncChatPromptTextareaHeight(el: HTMLTextAreaElement, message: string): void;
/** Same sizing rules for TipTap `.ProseMirror` root (`text` mirrors doc plain text length for empty-state). */
export declare function syncChatPromptComposerHeight(el: HTMLElement, text: string): void;
