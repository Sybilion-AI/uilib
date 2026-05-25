var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["SYSTEM"] = "system";
})(MessageRole || (MessageRole = {}));
/** System placeholder while dashboard generation runs (must match ChatSheet `addMessage` text). */
const GENERATING_DASHBOARD_SYSTEM_TEXT = 'Generating dashboard…';
/** Slash command id that triggers dashboard generation when `onGenerateDashboard` is set. */
const GENERATE_DASHBOARD_SLASH_COMMAND_ID = 'generate-dashboard';
function isGenerateDashboardSlashMessage(message) {
    return message.trim() === `/${GENERATE_DASHBOARD_SLASH_COMMAND_ID}`;
}

export { GENERATE_DASHBOARD_SLASH_COMMAND_ID, GENERATING_DASHBOARD_SYSTEM_TEXT, MessageRole, isGenerateDashboardSlashMessage };
