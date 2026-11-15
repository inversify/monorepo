import { type ServiceIdentifier } from 'inversify';

import { type TransportDeclaration } from './TransportDeclaration.js';

export interface CommandHandlerMetadata {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  command: Function;
  serviceIdentifier: ServiceIdentifier | undefined;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  target: Function;
  transports: TransportDeclaration[];
}
