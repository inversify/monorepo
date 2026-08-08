export interface ConfigService<TConfig> {
  get(): TConfig;
}
