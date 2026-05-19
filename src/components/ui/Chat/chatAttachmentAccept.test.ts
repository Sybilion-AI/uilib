import {
  TEXT_ATTACHMENT_ACCEPT_PARTS,
  buildAcceptAttr,
  filterToTextAttachments,
  isDocxFile,
  isPdfFile,
  isXlsxFile,
} from './chatAttachmentAccept';

function makeFile(name: string, type = ''): File {
  return { name, type } as File;
}

describe('TEXT_ATTACHMENT_ACCEPT_PARTS', () => {
  it('includes docx and xlsx MIME types and extensions', () => {
    expect(TEXT_ATTACHMENT_ACCEPT_PARTS).toContain('.docx');
    expect(TEXT_ATTACHMENT_ACCEPT_PARTS).toContain('.xlsx');
    expect(TEXT_ATTACHMENT_ACCEPT_PARTS).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(TEXT_ATTACHMENT_ACCEPT_PARTS).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });
});

describe('isDocxFile', () => {
  it('detects by extension and MIME type', () => {
    expect(
      isDocxFile(
        makeFile(
          'notes.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ),
    ).toBe(true);
    expect(isDocxFile(makeFile('notes.docx'))).toBe(true);
    expect(isDocxFile(makeFile('notes.txt'))).toBe(false);
  });
});

describe('isXlsxFile', () => {
  it('detects by extension and MIME type', () => {
    expect(
      isXlsxFile(
        makeFile(
          'data.xlsx',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ),
      ),
    ).toBe(true);
    expect(isXlsxFile(makeFile('data.xlsx'))).toBe(true);
    expect(isXlsxFile(makeFile('data.csv'))).toBe(false);
  });
});

describe('isPdfFile', () => {
  it('does not treat docx or xlsx as pdf', () => {
    expect(isPdfFile(makeFile('file.docx'))).toBe(false);
    expect(isPdfFile(makeFile('file.xlsx'))).toBe(false);
  });
});

describe('filterToTextAttachments', () => {
  it('keeps docx and xlsx tokens from the allowlist', () => {
    expect(
      filterToTextAttachments(['.docx', '.xlsx', 'application/pdf']),
    ).toEqual(['.docx', '.xlsx']);
  });
});

describe('buildAcceptAttr', () => {
  it('includes filtered text parts and optional pdf', () => {
    expect(buildAcceptAttr(['.docx', '.txt'], false)).toBe('.docx,.txt');
    expect(buildAcceptAttr(['.docx'], true)).toContain('.docx');
    expect(buildAcceptAttr(['.docx'], true)).toContain('.pdf');
  });
});
