import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigSource } from '../models/ConfigSource.js';

export function object(config: ConfigObject): ConfigSource {
  return {
    load(): ConfigObject {
      return config;
    },
  };
}
