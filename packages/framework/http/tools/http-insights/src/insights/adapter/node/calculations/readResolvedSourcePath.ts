import { isAbsolute, resolve } from 'node:path';

import { readFileUrlPath } from './readFileUrlPath.js';
import { readUrlScheme } from './readUrlScheme.js';

export function readResolvedSourcePath(
  source: string,
  sourceRoot: string | null,
  baseDirectory: string,
): string {
  const absoluteSource: string | null = readAbsoluteSource(source);

  if (absoluteSource !== null) {
    return absoluteSource;
  }

  const root: string | null = readAbsoluteSourceRoot(sourceRoot, baseDirectory);

  if (root === null) {
    return resolve(baseDirectory, source);
  }

  const rootScheme: string | null = readUrlScheme(root);

  if (rootScheme !== null && rootScheme !== 'file') {
    try {
      const base: string = root.endsWith('/') ? root : `${root}/`;

      return new URL(source, base).href;
    } catch (_error: unknown) {
      return source;
    }
  }

  return resolve(root, source);
}

function readAbsoluteSource(source: string): string | null {
  const scheme: string | null = readUrlScheme(source);

  if (scheme === 'file') {
    return readFileUrlPath(source);
  }

  if (scheme !== null) {
    return source;
  }

  if (isAbsolute(source)) {
    return source;
  }

  return null;
}

function readAbsoluteSourceRoot(
  sourceRoot: string | null,
  baseDirectory: string,
): string | null {
  if (sourceRoot === null || sourceRoot.length === 0) {
    return null;
  }

  const absoluteRoot: string | null = readAbsoluteSource(sourceRoot);

  if (absoluteRoot !== null) {
    return absoluteRoot;
  }

  return resolve(baseDirectory, sourceRoot);
}
