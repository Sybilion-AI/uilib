// Jest setup for uilib
import type { ReactNode } from 'react';

import { File as NodeFile } from 'node:buffer';

if (
  typeof globalThis.File === 'undefined' ||
  typeof globalThis.File.prototype.arrayBuffer !== 'function'
) {
  globalThis.File = NodeFile as typeof File;
}

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children?: ReactNode }) => children ?? null,
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => undefined,
}));
