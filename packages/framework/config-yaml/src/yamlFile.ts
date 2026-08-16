import { readFile } from 'node:fs/promises';

import {
  type ConfigObject,
  type ConfigSource,
  InversifyConfigError,
} from '@inversifyjs/config';
import { parse } from 'yaml';

export interface YamlFileOptions {
  path: string;
}

export function yamlFile(options: YamlFileOptions): ConfigSource {
  return {
    async load(): Promise<ConfigObject> {
      let content: string;

      try {
        content = await readFile(options.path, 'utf8');
      } catch (error: unknown) {
        throw new InversifyConfigError(
          `Unable to read YAML config at "${options.path}"`,
          { cause: error },
        );
      }

      let parsed: unknown;

      try {
        parsed = parse(content);
      } catch (error: unknown) {
        throw new InversifyConfigError(
          `Unable to parse YAML config at "${options.path}"`,
          { cause: error },
        );
      }

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new InversifyConfigError(
          `YAML config at "${options.path}" must be an object`,
        );
      }

      return parsed as ConfigObject;
    },
  };
}
