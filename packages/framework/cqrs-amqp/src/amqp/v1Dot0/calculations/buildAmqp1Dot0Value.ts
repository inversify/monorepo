import { type Amqp1Dot0Array } from '../models/Amqp1Dot0Array.js';
import { type Amqp1Dot0DescribedValue } from '../models/Amqp1Dot0DescribedValue.js';
import { type Amqp1Dot0List } from '../models/Amqp1Dot0List.js';
import { type Amqp1Dot0Map } from '../models/Amqp1Dot0Map.js';
import { type Amqp1Dot0TypeName } from '../models/Amqp1Dot0TypeName.js';
import { type Amqp1Dot0Value } from '../models/Amqp1Dot0Value.js';
import { MAP_ENTRY_WIDTH, readAmqpTypeName } from './amqpTypeCode.js';

interface RheaCompositeConstructor {
  readonly descriptor?: {
    readonly numeric?: number;
    readonly symbolic?: string;
  };
}

// rhea keeps a described value it does not know as a typed wrapper. A known
// composite is decoded into an instance whose constructor carries the
// descriptor. An array's element constructor is `array_constructor`.
interface RheaTyped {
  readonly array_constructor?: {
    readonly descriptor?: unknown;
    readonly typecode?: number;
  };
  readonly descriptor?: unknown;
  readonly toRheaTyped: () => unknown;
  readonly type?: {
    readonly typecode?: number;
  };
  readonly value: unknown;
}

function isRheaTyped(value: object): value is RheaTyped {
  return typeof (value as { toRheaTyped?: unknown }).toRheaTyped === 'function';
}

function readTypeCode(value: RheaTyped): number | undefined {
  const typeCode: unknown = value.type?.typecode;

  return typeof typeCode === 'number' ? typeCode : undefined;
}

function readCompositeDescriptor(value: object): number | string | undefined {
  if (typeof value.constructor !== 'function') {
    return undefined;
  }

  const descriptor: RheaCompositeConstructor['descriptor'] = (
    value.constructor as RheaCompositeConstructor
  ).descriptor;

  return descriptor?.symbolic ?? descriptor?.numeric;
}

function buildList(items: readonly unknown[]): Amqp1Dot0List {
  return {
    items: items.map(buildAmqp1Dot0Value),
    kind: 'list',
  };
}

function buildMap(
  entries: readonly (readonly [unknown, unknown])[],
): Amqp1Dot0Map {
  return {
    entries: entries.map(
      ([key, value]: readonly [unknown, unknown]): readonly [
        Amqp1Dot0Value,
        Amqp1Dot0Value,
      ] => [buildAmqp1Dot0Value(key), buildAmqp1Dot0Value(value)],
    ),
    kind: 'map',
  };
}

function buildTypedMap(value: unknown): Amqp1Dot0Map {
  const entries: unknown[] = Array.isArray(value) ? value : [];
  const pairs: (readonly [unknown, unknown])[] = [];

  for (
    let index: number = 0;
    index + 1 < entries.length;
    index += MAP_ENTRY_WIDTH
  ) {
    const key: unknown = entries[index];
    const entry: unknown = entries[index + 1];

    pairs.push([key, entry]);
  }

  return buildMap(pairs);
}

function buildObjectMap(value: object): Amqp1Dot0Map {
  return buildMap(Object.entries(value));
}

// The raw list is the composite. Field getters unwrap nested described values.
function buildCompositeList(value: object): Amqp1Dot0List {
  const raw: unknown[] = Array.isArray((value as { value?: unknown }).value)
    ? (value as { value: unknown[] }).value
    : [];

  return buildList(raw);
}

function buildTypedArray(value: RheaTyped): Amqp1Dot0Array {
  const typeCode: unknown = value.array_constructor?.typecode;

  if (typeof typeCode !== 'number') {
    throw new Error('Unsupported AMQP 1.0 array');
  }

  const items: Amqp1Dot0Value[] = (
    Array.isArray(value.value) ? value.value : []
  ).map(buildAmqp1Dot0Value);
  const elementType: Amqp1Dot0TypeName = readAmqpTypeName(typeCode);
  const descriptor: unknown = value.array_constructor?.descriptor;

  if (descriptor === undefined) {
    return { elementType, items, kind: 'array' };
  }

  return {
    elementDescriptor: buildAmqp1Dot0Value(descriptor),
    elementType,
    items,
    kind: 'array',
  };
}

function buildTypedBody(value: RheaTyped): Amqp1Dot0Value {
  const typeCode: number | undefined = readTypeCode(value);
  const typeName: Amqp1Dot0TypeName | undefined =
    typeCode === undefined ? undefined : readAmqpTypeName(typeCode);

  if (typeName === 'map') {
    return buildTypedMap(value.value);
  }

  if (typeName === 'array') {
    return buildTypedArray(value);
  }

  if (typeName === 'list') {
    return buildList(Array.isArray(value.value) ? value.value : []);
  }

  return buildAmqp1Dot0Value(value.value);
}

function buildTyped(value: RheaTyped): Amqp1Dot0Value {
  const body: Amqp1Dot0Value = buildTypedBody(value);

  if (value.descriptor === undefined) {
    return body;
  }

  return {
    descriptor: buildAmqp1Dot0Value(value.descriptor),
    kind: 'described',
    value: body,
  };
}

function buildDescribedValue(
  descriptor: unknown,
  value: Amqp1Dot0Value,
): Amqp1Dot0DescribedValue {
  return {
    descriptor: buildAmqp1Dot0Value(descriptor),
    kind: 'described',
    value,
  };
}

export function buildAmqp1Dot0Value(value: unknown): Amqp1Dot0Value {
  if (value === undefined || value === null) {
    return null;
  }

  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    value instanceof Date ||
    value instanceof Uint8Array
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return buildList(value);
  }

  if (value instanceof Map) {
    return buildMap([...value.entries()]);
  }

  if (typeof value !== 'object') {
    throw new Error(`Unsupported AMQP 1.0 value of type "${typeof value}"`);
  }

  if (isRheaTyped(value)) {
    return buildTyped(value);
  }

  const descriptor: number | string | undefined =
    readCompositeDescriptor(value);

  return descriptor === undefined
    ? buildObjectMap(value)
    : buildDescribedValue(descriptor, buildCompositeList(value));
}
