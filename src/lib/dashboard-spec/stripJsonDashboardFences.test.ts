import { stripJsonDashboardFences } from './stripJsonDashboardFences';

describe('stripJsonDashboardFences', () => {
  it('removes a closed json-dashboard fence', () => {
    const text = 'Summary\n```json-dashboard\n{"tiles":[]}\n```';
    expect(stripJsonDashboardFences(text)).toBe('Summary');
  });

  it('removes multiple closed fences', () => {
    const text = [
      'Intro',
      '```json-dashboard',
      '{"a":1}',
      '```',
      'Middle',
      '```json-dashboard',
      '{"b":2}',
      '```',
      'Outro',
    ].join('\n');
    expect(stripJsonDashboardFences(text)).toBe('Intro\n\nMiddle\n\nOutro');
  });

  it('strips from an unclosed fence to end of text', () => {
    const text = 'Summary\n```json-dashboard\n{"tiles":[]}';
    expect(stripJsonDashboardFences(text)).toBe('Summary');
  });

  it('strips fence with space after backticks', () => {
    const text = 'Summary\n``` json-dashboard\n{"tiles":[]}\n```';
    expect(stripJsonDashboardFences(text)).toBe('Summary');
  });

  it('preserves trailing markdown fences after dashboard block', () => {
    const text = [
      'Here is the layout:',
      '```json-dashboard',
      '{"tiles":[]}',
      '```',
      '',
      '```sql',
      'SELECT 1',
      '```',
    ].join('\n');
    expect(stripJsonDashboardFences(text)).toBe(
      ['Here is the layout:', '', '```sql', 'SELECT 1', '```'].join('\n'),
    );
  });

  it('strips dashboard block when json contains markdown code fences', () => {
    const spec = {
      schemaVersion: 1,
      tiles: [
        {
          id: 't1',
          widget: 'markdown',
          bindings: {
            content: 'Example:\n```sql\nSELECT 1\n```\nMore text',
          },
        },
      ],
    };
    const text = [
      '```json-dashboard',
      JSON.stringify(spec),
      '```',
      '',
      'Kenya Protest',
      '',
      'Geopolitical Risk',
    ].join('\n');
    expect(stripJsonDashboardFences(text)).toBe(
      ['Kenya Protest', '', 'Geopolitical Risk'].join('\n'),
    );
  });

  it('normalizes literal escaped newlines in follow-up responses', () => {
    const text =
      '```json-dashboard\\n{"tiles":[]}\\n```\\n\\nKenya Protest\\n\\nFunny summary';
    expect(stripJsonDashboardFences(text)).toBe(
      ['Kenya Protest', '', 'Funny summary'].join('\n'),
    );
  });
});
