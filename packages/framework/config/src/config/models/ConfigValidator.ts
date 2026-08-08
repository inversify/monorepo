import { type ConfigObject } from './ConfigObject.js';

export interface ConfigValidator<TConfig> {
  validate(input: ConfigObject): TConfig | Promise<TConfig>;
}
