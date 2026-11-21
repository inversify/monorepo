import { type AbstractNewable, type Newable } from '@inversifyjs/common';
import { type ServiceIdentifier } from 'inversify';

function isConstructable(value: unknown): value is AbstractNewable | Newable {
  return typeof value === 'function';
}

export function readServiceIdentifier(value: unknown): ServiceIdentifier {
  if (
    isConstructable(value) ||
    typeof value === 'string' ||
    typeof value === 'symbol'
  ) {
    return value;
  }

  throw new Error('Handler is not a service identifier');
}
