import { type ServiceIdentifier } from 'inversify';

export interface EventHandlerMetadata {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  event: Function;
  serviceIdentifier: ServiceIdentifier | undefined;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  target: Function;
}
