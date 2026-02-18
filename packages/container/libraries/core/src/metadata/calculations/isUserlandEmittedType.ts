import { type Newable } from '@inversifyjs/common';

const NON_USERLAND_TYPES: unknown[] = [
  Array,
  BigInt,
  Boolean,
  Function,
  Number,
  Object,
  String,
];

export function isUserlandEmittedType(type: Newable): boolean {
  return !NON_USERLAND_TYPES.includes(type);
}
