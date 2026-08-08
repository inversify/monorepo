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
      const content: string = await readFile(options.path, 'utf8');
      const parsed: unknown = parse(content);

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
