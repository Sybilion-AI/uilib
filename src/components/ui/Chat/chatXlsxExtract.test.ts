import * as XLSX from 'xlsx';

import { extractXlsxFileToText } from './chatXlsxExtract';

function makeXlsxFile(
  sheets: Record<string, (string | number)[][]>,
  name = 'test.xlsx',
): File {
  const workbook = XLSX.utils.book_new();
  for (const [sheetName, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(rows),
      sheetName,
    );
  }
  const buffer = new Uint8Array(
    XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }),
  );
  return new File([buffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('extractXlsxFileToText', () => {
  it('extracts non-empty sheets as CSV with headings', async () => {
    const file = makeXlsxFile({
      Data: [
        ['name', 'value'],
        ['a', 1],
      ],
    });

    const text = await extractXlsxFileToText(file);
    expect(text).toContain('## Sheet Data');
    expect(text).toContain('name,value');
    expect(text).toContain('a,1');
  });

  it('skips empty sheets', async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([]),
      'Empty',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([['x']]),
      'Filled',
    );
    const buffer = new Uint8Array(
      XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }),
    );
    const file = new File([buffer], 'mixed.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const text = await extractXlsxFileToText(file);
    expect(text).not.toContain('## Sheet Empty');
    expect(text).toContain('## Sheet Filled');
  });

  it('rejects files over the size limit', async () => {
    const huge = new Uint8Array(10 * 1024 * 1024 + 1);
    const file = new File([huge], 'huge.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await expect(extractXlsxFileToText(file)).rejects.toThrow(/too large/i);
  });
});
