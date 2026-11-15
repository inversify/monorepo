import { type ServiceIdentifier } from 'inversify';

import { type TransportDeclaration } from './TransportDeclaration.js';

export interface CommandHandlerConfig {
  command: {
    identifier: string | symbol | undefined;
    // oxlint-disable-next-line typescript/no-unsafe-function-type
    type: Function;
  };
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  handler: Function;
  serviceIdentifier: ServiceIdentifier | undefined;
  transport: TransportDeclaration;
}
