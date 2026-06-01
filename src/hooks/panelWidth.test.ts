import {
  CENTRAL_AREA_MIN_PX,
  CHAT_WIDTH_MIN_PX,
  SIDEBAR_WIDTH_MIN_PX,
  requiredShellWidthForSidebars,
  shellFitsSidebarsLayout,
} from './panelWidth';

describe('requiredShellWidthForSidebars', () => {
  it('sums only open panels plus central min', () => {
    expect(
      requiredShellWidthForSidebars({
        mainSidebarOpen: true,
        chatPanelOpen: true,
        sidebarWidthPx: 320,
        chatWidthPx: 600,
      }),
    ).toBe(320 + CENTRAL_AREA_MIN_PX + 600);

    expect(
      requiredShellWidthForSidebars({
        mainSidebarOpen: false,
        chatPanelOpen: true,
        sidebarWidthPx: 320,
        chatWidthPx: 600,
      }),
    ).toBe(CENTRAL_AREA_MIN_PX + 600);
  });

  it('falls back to panel mins when width is zero', () => {
    expect(
      requiredShellWidthForSidebars({
        mainSidebarOpen: true,
        chatPanelOpen: true,
        sidebarWidthPx: 0,
        chatWidthPx: 0,
      }),
    ).toBe(SIDEBAR_WIDTH_MIN_PX + CENTRAL_AREA_MIN_PX + CHAT_WIDTH_MIN_PX);
  });

  it('uses panel mins for sub-min stored widths when both panels are open', () => {
    expect(
      requiredShellWidthForSidebars({
        mainSidebarOpen: true,
        chatPanelOpen: true,
        sidebarWidthPx: 300,
        chatWidthPx: 37,
      }),
    ).toBe(300 + CENTRAL_AREA_MIN_PX + CHAT_WIDTH_MIN_PX);
  });

  it('keeps actual chat width when only chat is open', () => {
    expect(
      requiredShellWidthForSidebars({
        mainSidebarOpen: false,
        chatPanelOpen: true,
        sidebarWidthPx: 300,
        chatWidthPx: 337,
      }),
    ).toBe(CENTRAL_AREA_MIN_PX + 337);
  });
});

describe('shellFitsSidebarsLayout', () => {
  it('returns true when shell meets required width', () => {
    expect(
      shellFitsSidebarsLayout(1600, {
        mainSidebarOpen: true,
        chatPanelOpen: true,
        sidebarWidthPx: 300,
        chatWidthPx: 500,
      }),
    ).toBe(true);
  });

  it('returns false when shell is too narrow for both panels', () => {
    expect(
      shellFitsSidebarsLayout(1500, {
        mainSidebarOpen: true,
        chatPanelOpen: true,
        sidebarWidthPx: 300,
        chatWidthPx: 500,
      }),
    ).toBe(false);
  });

  it('returns false when sub-min chat width would falsely fit at shell edge', () => {
    expect(
      shellFitsSidebarsLayout(1137, {
        mainSidebarOpen: true,
        chatPanelOpen: true,
        sidebarWidthPx: 300,
        chatWidthPx: 37,
      }),
    ).toBe(false);
  });

  it('returns true for unknown shell width', () => {
    expect(
      shellFitsSidebarsLayout(0, {
        mainSidebarOpen: true,
        chatPanelOpen: true,
        sidebarWidthPx: 300,
        chatWidthPx: 500,
      }),
    ).toBe(true);
  });
});
