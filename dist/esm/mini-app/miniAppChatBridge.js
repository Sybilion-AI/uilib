import { resolveParentOriginFromReferrer, buildChatSendMessage, isTrustedMiniAppParentMessage, parseChatSendResultMessage } from './miniAppProtocol.js';

const DEFAULT_TIMEOUT_MS = 60_000;
/**
 * Ask the Sybilion host to send a chat message with its auth token.
 * Does not update host ChatSheet state — same session as `chatId` on the agent only.
 */
async function sendChatMessage(chatId, message) {
    if (typeof window === 'undefined' || window.parent === window) {
        throw new Error('sendChatMessage requires an embedded mini-app (iframe)');
    }
    const requestId = crypto.randomUUID();
    const target = resolveParentOriginFromReferrer();
    const payload = { requestId, chatId, message };
    const msg = buildChatSendMessage(payload);
    return new Promise((resolve, reject) => {
        const onMessage = (event) => {
            if (!isTrustedMiniAppParentMessage(event))
                return;
            const parsed = parseChatSendResultMessage(event.data);
            if (!parsed || parsed.requestId !== requestId)
                return;
            window.removeEventListener('message', onMessage);
            clearTimeout(timer);
            if (parsed.ok === true) {
                resolve(parsed.result);
                return;
            }
            reject(new Error(parsed.error));
        };
        window.addEventListener('message', onMessage);
        const timer = setTimeout(() => {
            window.removeEventListener('message', onMessage);
            reject(new Error('Mini-app chat request timed out'));
        }, DEFAULT_TIMEOUT_MS);
        if (target) {
            window.parent.postMessage(msg, target);
        }
        else {
            window.parent.postMessage(msg, '*');
        }
    });
}

export { sendChatMessage };
