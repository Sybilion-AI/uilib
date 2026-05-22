const CHAT_PROMPT_EMPTY_DOC = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
};
function chatPromptParagraphDoc(text) {
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: text ? [{ type: 'text', text }] : [],
            },
        ],
    };
}

export { CHAT_PROMPT_EMPTY_DOC, chatPromptParagraphDoc };
