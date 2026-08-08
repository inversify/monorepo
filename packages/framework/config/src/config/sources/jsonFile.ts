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
      let content: string;

      try {
        content = await readFile(options.path, 'utf8');
      } catch (error: unknown) {
        throw new InversifyConfigError(
          `Unable to read JSON config at "${options.path}"`,
          { cause: error },
        );
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(content);
      } catch (error: unknown) {
        throw new InversifyConfigError(
          `Unable to parse JSON config at "${options.path}"`,
          { cause: error },
        );
      }

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
