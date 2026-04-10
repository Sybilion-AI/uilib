var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["SYSTEM"] = "system";
})(MessageRole || (MessageRole = {}));
/** System placeholder while dashboard generation runs (must match ChatSheet `addMessage` text). */
const GENERATING_DASHBOARD_SYSTEM_TEXT = 'Generating dashboard…';

export { GENERATING_DASHBOARD_SYSTEM_TEXT, MessageRole };
