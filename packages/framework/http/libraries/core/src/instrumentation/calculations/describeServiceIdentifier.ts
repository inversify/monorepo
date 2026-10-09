import {
  type ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';
import { isPipe, type Pipe } from '@inversifyjs/framework-core';

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
    return describeServiceIdentifier(
      pipeOrServiceIdentifier.constructor as ServiceIdentifier,
    );
  }

  return describeServiceIdentifier(pipeOrServiceIdentifier);
}

export function describeServiceIdentifier(
  serviceIdentifier: ServiceIdentifier,
): string {
  const description: string = stringifyServiceIdentifier(serviceIdentifier);

  return description === '' ? '(anonymous)' : description;
}
