/** Keep in sync with `ChatPrompt.styl` `INPUT_MAX_HEIGHT` / `min-height`. */
export declare const PROMPT_INPUT_MAX_HEIGHT_PX = 200;
export declare const PROMPT_INPUT_MIN_HEIGHT_PX = 40;
export declare function chatPromptTextareaFloorPx(cs: CSSStyleDeclaration): number;
/** Autosizing textarea inside flex shells: empty → floor only; typed → collapse measure + clamp. */
export declare function syncChatPromptTextareaHeight(el: HTMLTextAreaElement, message: string): void;
