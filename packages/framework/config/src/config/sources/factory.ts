import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigSource } from '../models/ConfigSource.js';

export function factory(
  load: () => ConfigObject | Promise<ConfigObject>,
): ConfigSource {
  return {
    load,
  };
}
