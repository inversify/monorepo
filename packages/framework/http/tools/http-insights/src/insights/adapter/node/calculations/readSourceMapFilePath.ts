import { dirname, isAbsolute, resolve } from 'node:path';

import { readFileUrlPath } from './readFileUrlPath.js';
import { readUrlScheme } from './readUrlScheme.js';

export function readSourceMapFilePath(
  generatedPath: string,
  url: string,
): string | null {
  const scheme: string | null = readUrlScheme(url);

  if (scheme === 'http' || scheme === 'https') {
    return null;
  }

  if (scheme === 'file') {
    return readFileUrlPath(url);
  }

  if (scheme !== null) {
    return null;
  }

  if (isAbsolute(url)) {
    return url;
  }

  return resolve(dirname(generatedPath), url);
}
