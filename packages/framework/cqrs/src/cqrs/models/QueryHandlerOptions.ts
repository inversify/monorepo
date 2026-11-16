import { type ServiceIdentifier } from 'inversify';

export interface QueryHandlerOptions {
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  query: Function;
  serviceIdentifier?: ServiceIdentifier;
}
