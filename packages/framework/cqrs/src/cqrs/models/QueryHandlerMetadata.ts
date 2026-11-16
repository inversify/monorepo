import { type ServiceIdentifier } from 'inversify';

export interface QueryHandlerMetadata {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  query: Function;
  serviceIdentifier: ServiceIdentifier | undefined;
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  target: Function;
}
