/**
 * An AMQP 1.0 simple value. The AMQP type is inferred when encoding: integers
 * become `uint`, `ulong`, `int`, or `long`, other numbers `double`, and strings
 * `string`. Received symbols are strings and timestamps are dates. A
 * described value, list, map, or array is not a simple value.
 */
export type Amqp1Dot0SimpleValue =
  | boolean
  | Date
  | null
  | number
  | string
  | Uint8Array;
