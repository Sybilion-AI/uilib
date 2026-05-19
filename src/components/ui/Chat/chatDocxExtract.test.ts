import { extractDocxFileToText } from './chatDocxExtract';

const extractRawText = jest.fn();

jest.mock('mammoth', () => ({
  extractRawText: (...args: unknown[]) => extractRawText(...args),
}));

describe('extractDocxFileToText', () => {
  beforeEach(() => {
    extractRawText.mockReset();
  });

  it('returns trimmed text from mammoth', async () => {
    extractRawText.mockResolvedValue({
      value: '  Hello from Word  ',
      messages: [],
    });

    const file = new File([new Uint8Array(8)], 'doc.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    await expect(extractDocxFileToText(file)).resolves.toBe('Hello from Word');
    expect(extractRawText).toHaveBeenCalledTimes(1);
  });

  it('throws when mammoth reports errors', async () => {
    extractRawText.mockResolvedValue({
      value: '',
      messages: [{ type: 'error', message: 'corrupt file' }],
    });

    const file = new File([new Uint8Array(8)], 'bad.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    await expect(extractDocxFileToText(file)).rejects.toThrow(/corrupt file/i);
  });
});
