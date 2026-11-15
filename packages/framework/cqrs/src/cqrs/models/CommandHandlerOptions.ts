import { type ServiceIdentifier } from 'inversify';

import { type TransportDeclaration } from './TransportDeclaration.js';

export interface CommandHandlerOptions {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  command: Function;
  serviceIdentifier?: ServiceIdentifier;
  transports: TransportDeclaration[];
}
