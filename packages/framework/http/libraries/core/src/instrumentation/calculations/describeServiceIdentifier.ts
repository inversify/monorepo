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
  return describeServiceIdentifier(
    readPipeServiceIdentifier(pipeOrServiceIdentifier),
  );
}

export function readPipeServiceIdentifier(
  pipeOrServiceIdentifier: ServiceIdentifier<Pipe> | Pipe,
): ServiceIdentifier<Pipe> {
  if (isPipe(pipeOrServiceIdentifier)) {
    return pipeOrServiceIdentifier.constructor as ServiceIdentifier<Pipe>;
  }

  return pipeOrServiceIdentifier;
}

export function describeServiceIdentifier(
  serviceIdentifier: ServiceIdentifier,
): string {
  const description: string = stringifyServiceIdentifier(serviceIdentifier);

  return description === '' ? '(anonymous)' : description;
}
