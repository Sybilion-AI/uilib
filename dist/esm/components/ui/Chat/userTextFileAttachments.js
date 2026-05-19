/** File attachments on a stored message. */
function userTextFileAttachmentsFromMessage(message) {
    return message.userTextFileAttachments ?? [];
}

export { userTextFileAttachmentsFromMessage };
