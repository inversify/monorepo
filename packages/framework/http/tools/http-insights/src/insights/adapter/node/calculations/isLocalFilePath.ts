import { isAbsolute } from 'node:path';

import { readUrlScheme } from './readUrlScheme.js';

export function isLocalFilePath(filePath: string): boolean {
  return readUrlScheme(filePath) === null && isAbsolute(filePath);
}
