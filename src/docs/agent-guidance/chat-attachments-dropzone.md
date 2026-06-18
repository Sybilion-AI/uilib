ChatChrome supports a file dropzone: users drag text, Office, or PDF files onto the chat panel and the parsed content attaches to the prompt until they send. Configure accepted types via allowedAttachments and enable PDFs with allowPdfAttachments.

## When to use

- When users need to give the assistant file context, such as CSV data or documents.
- When attached files should be reviewed alongside the typed prompt before sending.

## When not to use

- For persistent file uploads to storage; use a dedicated upload flow.
- When only plain text input is expected; omit the attachment props to disable the dropzone.

## Do

- Office and PDF parsers load on demand, so the first attachment of those types incurs a one-off load.
