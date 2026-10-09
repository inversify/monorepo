import { isPipe, type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

export function describeMethodKey(methodKey: string | symbol): string {
  if (typeof methodKey === 'string') {
    return methodKey;
  }

  return methodKey.description ?? methodKey.toString();
}

export function describePipe(
  pipeOrServiceIdentifier: ServiceIdentifier<Pipe> | Pipe,
): string {
  if (isPipe(pipeOrServiceIdentifier)) {
    return describeServiceIdentifier(pipeOrServiceIdentifier.constructor);
  }

  return describeServiceIdentifier(pipeOrServiceIdentifier);
}

export function describeServiceIdentifier(serviceIdentifier: unknown): string {
  switch (typeof serviceIdentifier) {
    case 'function':
      return serviceIdentifier.name === ''
        ? 'anonymous'
        : serviceIdentifier.name;
    case 'string':
      return serviceIdentifier;
    case 'symbol':
      return serviceIdentifier.description ?? serviceIdentifier.toString();
    default:
      return 'anonymous';
  }
}
