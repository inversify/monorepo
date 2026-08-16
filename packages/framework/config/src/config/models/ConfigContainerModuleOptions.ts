import { type StandardSchemaV1 } from '@standard-schema/spec';
import { type ServiceIdentifier } from 'inversify';

import { type ConfigObject } from './ConfigObject.js';
import { type ConfigService } from './ConfigService.js';
import { type ConfigSource } from './ConfigSource.js';
import { type ConfigValidator } from './ConfigValidator.js';

export interface ConfigContainerModuleOptions<TConfig = ConfigObject> {
  source: ConfigSource;
  validate?: ConfigValidator<TConfig> | StandardSchemaV1<TConfig>;
  serviceIdentifier?: ServiceIdentifier<ConfigService<TConfig>>;
}
