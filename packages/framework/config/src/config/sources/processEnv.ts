import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigSource } from '../models/ConfigSource.js';

export interface ProcessEnvOptions {
  pick?: string[];
}

export function processEnv(options?: ProcessEnvOptions): ConfigSource {
  return {
    load(): ConfigObject {
      const config: ConfigObject = {};
      const keys: string[] = options?.pick ?? Object.keys(process.env);

      for (const key of keys) {
        const value: string | undefined = process.env[key];

        if (value !== undefined) {
          config[key] = value;
        }
      }

      return config;
    },
  };
}
