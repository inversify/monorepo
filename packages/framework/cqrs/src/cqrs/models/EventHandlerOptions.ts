import { type ServiceIdentifier } from 'inversify';

export interface EventHandlerOptions {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  event: Function;
  serviceIdentifier?: ServiceIdentifier;
}
