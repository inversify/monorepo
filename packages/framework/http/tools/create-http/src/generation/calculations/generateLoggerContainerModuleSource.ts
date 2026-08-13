export function generateLoggerContainerModuleSource(): string {
  return `import {
  ConsoleLogger,
  type Logger,
  type LoggerOptions,
} from '@inversifyjs/logger';
import {
  ContainerModule,
  type ContainerModuleLoadOptions,
} from 'inversify';

import { loggerFactoryIdentifier } from '../models/loggerFactoryIdentifier.js';

export class LoggerContainerModule extends ContainerModule {
  constructor(options: LoggerOptions) {
    super((loadOptions: ContainerModuleLoadOptions) => {
      loadOptions
        .bind<(context: string) => Logger>(loggerFactoryIdentifier)
        .toFactory(() => {
          return (context: string): Logger => {
            return new ConsoleLogger(context, options);
          };
        });
    });
  }
}
`;
}
