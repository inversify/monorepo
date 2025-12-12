import { ServiceIdentifier } from '@inversifyjs/common';
import { CloneableFunction } from '@inversifyjs/react-code-runner';

export function serviceIdentifierToString(
  serviceIdentifier: ServiceIdentifier | CloneableFunction,
): string {
  if (typeof serviceIdentifier === 'string') {
    return serviceIdentifier;
  } else if (typeof serviceIdentifier === 'symbol') {
    return serviceIdentifier.toString();
  } else if (
    typeof serviceIdentifier === 'function' ||
    typeof serviceIdentifier === 'object'
  ) {
    return serviceIdentifier.name === ''
      ? 'AnonymousFunction'
      : serviceIdentifier.name;
  }
  return 'Unknown';
}
