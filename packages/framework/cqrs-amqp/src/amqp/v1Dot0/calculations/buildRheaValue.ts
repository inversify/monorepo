import rhea from 'rhea';

import { type Amqp1Dot0Array } from '../models/Amqp1Dot0Array.js';
import { type Amqp1Dot0Map } from '../models/Amqp1Dot0Map.js';
import { type Amqp1Dot0TypeName } from '../models/Amqp1Dot0TypeName.js';
import { type Amqp1Dot0Value } from '../models/Amqp1Dot0Value.js';
import { readAmqpTypeCode } from './amqpTypeCode.js';
import { buildBuffer } from './buildBuffer.js';

function isNestedArrayElementType(elementType: string): boolean {
  return elementType === 'array';
}

// A string descriptor is a symbol and a numeric one is an unsigned long,
// matching the two descriptor forms in the type system.
function buildRheaDescriptor(descriptor: Amqp1Dot0Value): unknown {
  if (typeof descriptor === 'string') {
    return rhea.types.wrap_symbol(descriptor);
  }

  if (typeof descriptor === 'number') {
    return rhea.types.wrap_ulong(descriptor);
  }

  return rhea.types.wrap(buildRheaValue(descriptor));
}

function buildArrayItem(
  elementType: Amqp1Dot0TypeName,
  item: Amqp1Dot0Value,
): unknown {
  if (elementType === 'array') {
    throw new Error('Nested AMQP 1.0 arrays cannot be encoded');
  }

  if (elementType === 'list') {
    if (
      item === null ||
      typeof item !== 'object' ||
      !('kind' in item) ||
      item.kind !== 'list'
    ) {
      throw new Error(
        `AMQP 1.0 array element does not match type "${elementType}"`,
      );
    }

    const wrapped: { readonly value: unknown } = rhea.types.wrap_list(
      item.items.map(buildRheaValue),
    );

    return wrapped.value;
  }

  if (elementType === 'map') {
    if (
      item === null ||
      typeof item !== 'object' ||
      !('kind' in item) ||
      item.kind !== 'map'
    ) {
      throw new Error(
        `AMQP 1.0 array element does not match type "${elementType}"`,
      );
    }

    return item.entries.flatMap(
      ([key, entry]: readonly [Amqp1Dot0Value, Amqp1Dot0Value]): unknown[] => [
        rhea.types.wrap(buildRheaValue(key)),
        rhea.types.wrap(buildRheaValue(entry)),
      ],
    );
  }

  if (item instanceof Uint8Array) {
    return buildBuffer(item);
  }

  if (
    item === null ||
    item instanceof Date ||
    typeof item === 'boolean' ||
    typeof item === 'number' ||
    typeof item === 'string'
  ) {
    return item;
  }

  throw new Error(
    `AMQP 1.0 array element does not match type "${elementType}"`,
  );
}

function buildRheaArray(value: Amqp1Dot0Array): unknown {
  if (isNestedArrayElementType(value.elementType)) {
    throw new Error('Nested AMQP 1.0 arrays cannot be encoded');
  }

  return rhea.types.wrap_array(
    value.items.map((item: Amqp1Dot0Value): unknown =>
      buildArrayItem(value.elementType, item),
    ),
    readAmqpTypeCode(value.elementType),
    value.elementDescriptor === undefined
      ? undefined
      : buildRheaDescriptor(value.elementDescriptor),
  );
}

function buildRheaMap(value: Amqp1Dot0Map): Map<unknown, unknown> {
  return new Map(
    value.entries.map(
      ([key, entry]: readonly [Amqp1Dot0Value, Amqp1Dot0Value]): [
        unknown,
        unknown,
      ] => [buildRheaValue(key), buildRheaValue(entry)],
    ),
  );
}

export function buildRheaValue(value: Amqp1Dot0Value): unknown {
  if (value instanceof Uint8Array) {
    return buildBuffer(value);
  }

  if (value === null || value instanceof Date || typeof value !== 'object') {
    return value;
  }

  switch (value.kind) {
    case 'array':
      return buildRheaArray(value);
    case 'described':
      return rhea.types.described(
        buildRheaDescriptor(value.descriptor),
        rhea.types.wrap(buildRheaValue(value.value)),
      );
    case 'list':
      return value.items.map(buildRheaValue);
    case 'map':
      return buildRheaMap(value);
  }

  throw new Error('Unsupported AMQP 1.0 value');
}
