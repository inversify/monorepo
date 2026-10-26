import { type Stats } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';

import { injectable } from 'inversify';

import {
  type SourceText,
  type SourceTextReader,
} from '../../../application/ports/SourceTextReader.js';

export const MAX_SOURCE_FILE_BYTES: number = 8_000_000;

interface CachedSource {
  readonly source: string;
  readonly version: string;
}

@injectable()
export class NodeSourceTextReader implements SourceTextReader {
  readonly #cache: Map<string, CachedSource> = new Map();

  public async read(filePath: string): Promise<SourceText | null> {
    let resolvedPath: string;

    try {
      resolvedPath = await realpath(filePath);
    } catch (_error: unknown) {
      return null;
    }

    let fileStats: Stats;

    try {
      fileStats = await stat(resolvedPath);
    } catch (_error: unknown) {
      return null;
    }

    if (!fileStats.isFile() || fileStats.size > MAX_SOURCE_FILE_BYTES) {
      return null;
    }

    const version: string = `${String(fileStats.mtimeMs)}:${String(fileStats.size)}`;
    const cached: CachedSource | undefined = this.#cache.get(resolvedPath);

    if (cached !== undefined && cached.version === version) {
      return {
        path: resolvedPath,
        source: cached.source,
        version,
      };
    }

    try {
      const source: string = await readFile(resolvedPath, 'utf8');

      this.#cache.set(resolvedPath, {
        source,
        version,
      });

      return {
        path: resolvedPath,
        source,
        version,
      };
    } catch (_error: unknown) {
      return null;
    }
  }
}
