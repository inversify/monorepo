import { readFile } from 'node:fs/promises';

import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigSource } from '../models/ConfigSource.js';
import { InversifyConfigError } from '../models/InversifyConfigError.js';

export interface JsonFileOptions {
  path: string;
}

export function jsonFile(options: JsonFileOptions): ConfigSource {
  return {
    async load(): Promise<ConfigObject> {
      const content: string = await readFile(options.path, 'utf8');
      const parsed: unknown = JSON.parse(content);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new InversifyConfigError(
          `JSON config at "${options.path}" must be an object`,
        );
      }

      return parsed as ConfigObject;
    },
  };
}
