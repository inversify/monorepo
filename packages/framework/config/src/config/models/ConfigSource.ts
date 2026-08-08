import { type ConfigObject } from './ConfigObject.js';

export interface ConfigSource {
  load(): ConfigObject | Promise<ConfigObject>;
}
