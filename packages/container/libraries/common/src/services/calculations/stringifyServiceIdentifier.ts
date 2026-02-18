import type { ServiceIdentifier } from '../models/ServiceIdentifier.js';

export function stringifyServiceIdentifier(
  serviceIdentifier: ServiceIdentifier,
): string {
  switch (typeof serviceIdentifier) {
    case 'string':
    case 'symbol':
      return serviceIdentifier.toString();
    case 'function':
      return serviceIdentifier.name;
    default:
      throw new Error(`Unexpected ${typeof serviceIdentifier} service id type`);
  }
}
