import { readFile } from 'node:fs/promises';

import {
  type ConfigObject,
  type ConfigSource,
  InversifyConfigError,
} from '@inversifyjs/config';
import { parse } from 'dotenv';

export interface EnvFileOptions {
  path?: string | string[];
}

export function envFile(options?: EnvFileOptions): ConfigSource {
  const paths: string[] =
    options?.path === undefined
      ? ['.env']
      : Array.isArray(options.path)
        ? options.path
        : [options.path];

  return {
    async load(): Promise<ConfigObject> {
      const config: ConfigObject = {};

      for (const path of paths) {
        try {
          const content: string = await readFile(path, 'utf8');
          Object.assign(config, parse(content));
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            'code' in error &&
            error.code === 'ENOENT'
          ) {
            continue;
          }

          throw new InversifyConfigError(
            `Unable to load env config at "${path}"`,
            { cause: error },
          );
        }
      }

      return config;
    },
  };
}
