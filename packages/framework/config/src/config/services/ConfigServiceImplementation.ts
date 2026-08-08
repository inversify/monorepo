import { type ConfigService } from '../models/ConfigService.js';

export class ConfigServiceImplementation<
  TConfig,
> implements ConfigService<TConfig> {
  readonly #config: TConfig;

  constructor(config: TConfig) {
    this.#config = config;
  }

  public get(): TConfig {
    return this.#config;
  }
}
