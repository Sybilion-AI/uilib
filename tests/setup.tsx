// Jest setup for uilib
import { File as NodeFile } from 'node:buffer';

if (
  typeof globalThis.File === 'undefined' ||
  typeof globalThis.File.prototype.arrayBuffer !== 'function'
) {
  globalThis.File = NodeFile as typeof File;
}
