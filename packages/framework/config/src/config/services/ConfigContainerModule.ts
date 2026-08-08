import {
  ContainerModule,
  type ContainerModuleLoadOptions,
  type ServiceIdentifier,
} from 'inversify';

import { validateConfig } from '../calculations/validateConfig.js';
import { type ConfigContainerModuleOptions } from '../models/ConfigContainerModuleOptions.js';
import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigService } from '../models/ConfigService.js';
import { configServiceIdentifier } from '../models/configServiceIdentifier.js';
import { ConfigServiceImplementation } from './ConfigServiceImplementation.js';

export class ConfigContainerModule extends ContainerModule {
  constructor(options: ConfigContainerModuleOptions<unknown>) {
    super(
      async (
        containerModuleOptions: ContainerModuleLoadOptions,
      ): Promise<void> => {
        const rawConfig: ConfigObject = await Promise.resolve(
          options.source.load(),
        );

        const config: unknown =
          options.validate === undefined
            ? rawConfig
            : await validateConfig(rawConfig, options.validate);

        const serviceIdentifier: ServiceIdentifier<ConfigService<unknown>> =
          options.serviceIdentifier ?? configServiceIdentifier;

        containerModuleOptions
          .bind(serviceIdentifier)
          .toConstantValue(new ConfigServiceImplementation(config));
      },
    );
  }

  public static fromOptions<TConfig = ConfigObject>(
    options: ConfigContainerModuleOptions<TConfig>,
  ): ConfigContainerModule {
    return new ConfigContainerModule(options);
  }
}
