import { jsx } from 'react/jsx-runtime';
import { FileSpreadsheet } from 'lucide-react';

function CsvIcon({ size = 32 }) {
    return (jsx(FileSpreadsheet, { size: size, "aria-hidden": true, strokeWidth: 1.75, color: "currentColor" }));
}

export { CsvIcon };
