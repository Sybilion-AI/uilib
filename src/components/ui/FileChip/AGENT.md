FileChip is a compact row that represents a file with a format icon, name, and hint text. It supports an onClick handler for downloadable files and an onRemove handler for detachable attachments, and truncates long file names gracefully.

## When to use

- To show attachments in a chat composer or message, with a remove control.
- To offer downloadable files, such as CSV presets, where clicking the chip starts the download.
- Anywhere a full file card would be too heavy and only the name and format matter.

## When not to use

- As the upload control itself; use DropZone or a file input to collect the file first.
- For rich file previews with thumbnails or metadata; use a card layout instead.

## Do

- Set the hint to describe the action, such as “Download CSV file”, so the affordance is clear.
- Pass the correct format so the chip shows the right icon for the file type.
