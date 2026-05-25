import {
  GENERATE_DASHBOARD_SLASH_COMMAND_ID,
  isGenerateDashboardSlashMessage,
} from './Chat.types';

describe('isGenerateDashboardSlashMessage', () => {
  it('matches exact slash command', () => {
    expect(
      isGenerateDashboardSlashMessage(
        `/${GENERATE_DASHBOARD_SLASH_COMMAND_ID}`,
      ),
    ).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    expect(
      isGenerateDashboardSlashMessage(
        `  /${GENERATE_DASHBOARD_SLASH_COMMAND_ID}  `,
      ),
    ).toBe(true);
  });

  it('rejects plain text and partial commands', () => {
    expect(isGenerateDashboardSlashMessage('generate-dashboard')).toBe(false);
    expect(isGenerateDashboardSlashMessage('/generate')).toBe(false);
    expect(
      isGenerateDashboardSlashMessage(
        `/ ${GENERATE_DASHBOARD_SLASH_COMMAND_ID}`,
      ),
    ).toBe(false);
  });
});
