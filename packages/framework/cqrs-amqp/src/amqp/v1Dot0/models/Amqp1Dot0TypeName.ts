/**
 * An AMQP 1.0 type name. Several wire encodings share one name: `uint`
 * covers `uint0`, the small uint, and the 4-byte uint.
 */
export type Amqp1Dot0TypeName =
  | 'array'
  | 'binary'
  | 'boolean'
  | 'byte'
  | 'char'
  | 'decimal128'
  | 'decimal32'
  | 'decimal64'
  | 'double'
  | 'float'
  | 'int'
  | 'list'
  | 'long'
  | 'map'
  | 'null'
  | 'short'
  | 'string'
  | 'symbol'
  | 'timestamp'
  | 'ubyte'
  | 'uint'
  | 'ulong'
  | 'ushort'
  | 'uuid';
