import { type Amqp1Dot0TypeName } from '../models/Amqp1Dot0TypeName.js';

class AmqpTypeCode {
  public static readonly array32: number = 0xf0;
  public static readonly array8: number = 0xe0;
  public static readonly binary32: number = 0xb0;
  public static readonly binary8: number = 0xa0;
  public static readonly boolean: number = 0x56;
  public static readonly byte: number = 0x51;
  public static readonly char: number = 0x73;
  public static readonly decimal128: number = 0x94;
  public static readonly decimal32: number = 0x74;
  public static readonly decimal64: number = 0x84;
  public static readonly double: number = 0x82;
  public static readonly falseValue: number = 0x42;
  public static readonly float: number = 0x72;
  public static readonly int: number = 0x71;
  public static readonly list0: number = 0x45;
  public static readonly list32: number = 0xd0;
  public static readonly list8: number = 0xc0;
  public static readonly long: number = 0x81;
  public static readonly map32: number = 0xd1;
  public static readonly map8: number = 0xc1;
  public static readonly mapPair: number = 2;
  public static readonly nullValue: number = 0x40;
  public static readonly short: number = 0x61;
  public static readonly smallInt: number = 0x54;
  public static readonly smallLong: number = 0x55;
  public static readonly smallUint: number = 0x52;
  public static readonly smallUlong: number = 0x53;
  public static readonly string32: number = 0xb1;
  public static readonly string8: number = 0xa1;
  public static readonly symbol32: number = 0xb3;
  public static readonly symbol8: number = 0xa3;
  public static readonly timestamp: number = 0x83;
  public static readonly trueValue: number = 0x41;
  public static readonly ubyte: number = 0x50;
  public static readonly uint: number = 0x70;
  public static readonly uint0: number = 0x43;
  public static readonly ulong: number = 0x80;
  public static readonly ulong0: number = 0x44;
  public static readonly ushort: number = 0x60;
  public static readonly uuid: number = 0x98;
}

export const MAP_ENTRY_WIDTH: number = AmqpTypeCode.mapPair;

const TYPE_CODE: Record<Amqp1Dot0TypeName, number> = {
  array: AmqpTypeCode.array32,
  binary: AmqpTypeCode.binary32,
  boolean: AmqpTypeCode.boolean,
  byte: AmqpTypeCode.byte,
  char: AmqpTypeCode.char,
  decimal32: AmqpTypeCode.decimal32,
  decimal64: AmqpTypeCode.decimal64,
  decimal128: AmqpTypeCode.decimal128,
  double: AmqpTypeCode.double,
  float: AmqpTypeCode.float,
  int: AmqpTypeCode.int,
  list: AmqpTypeCode.list32,
  long: AmqpTypeCode.long,
  map: AmqpTypeCode.map32,
  null: AmqpTypeCode.nullValue,
  short: AmqpTypeCode.short,
  string: AmqpTypeCode.string32,
  symbol: AmqpTypeCode.symbol32,
  timestamp: AmqpTypeCode.timestamp,
  ubyte: AmqpTypeCode.ubyte,
  uint: AmqpTypeCode.uint,
  ulong: AmqpTypeCode.ulong,
  ushort: AmqpTypeCode.ushort,
  uuid: AmqpTypeCode.uuid,
};

const TYPE_NAME: ReadonlyMap<number, Amqp1Dot0TypeName> = new Map([
  [AmqpTypeCode.array32, 'array'],
  [AmqpTypeCode.array8, 'array'],
  [AmqpTypeCode.binary32, 'binary'],
  [AmqpTypeCode.binary8, 'binary'],
  [AmqpTypeCode.boolean, 'boolean'],
  [AmqpTypeCode.byte, 'byte'],
  [AmqpTypeCode.char, 'char'],
  [AmqpTypeCode.decimal128, 'decimal128'],
  [AmqpTypeCode.decimal32, 'decimal32'],
  [AmqpTypeCode.decimal64, 'decimal64'],
  [AmqpTypeCode.double, 'double'],
  [AmqpTypeCode.falseValue, 'boolean'],
  [AmqpTypeCode.float, 'float'],
  [AmqpTypeCode.int, 'int'],
  [AmqpTypeCode.list0, 'list'],
  [AmqpTypeCode.list32, 'list'],
  [AmqpTypeCode.list8, 'list'],
  [AmqpTypeCode.long, 'long'],
  [AmqpTypeCode.map32, 'map'],
  [AmqpTypeCode.map8, 'map'],
  [AmqpTypeCode.nullValue, 'null'],
  [AmqpTypeCode.short, 'short'],
  [AmqpTypeCode.smallInt, 'int'],
  [AmqpTypeCode.smallLong, 'long'],
  [AmqpTypeCode.smallUint, 'uint'],
  [AmqpTypeCode.smallUlong, 'ulong'],
  [AmqpTypeCode.string32, 'string'],
  [AmqpTypeCode.string8, 'string'],
  [AmqpTypeCode.symbol32, 'symbol'],
  [AmqpTypeCode.symbol8, 'symbol'],
  [AmqpTypeCode.timestamp, 'timestamp'],
  [AmqpTypeCode.trueValue, 'boolean'],
  [AmqpTypeCode.ubyte, 'ubyte'],
  [AmqpTypeCode.uint, 'uint'],
  [AmqpTypeCode.uint0, 'uint'],
  [AmqpTypeCode.ulong, 'ulong'],
  [AmqpTypeCode.ulong0, 'ulong'],
  [AmqpTypeCode.ushort, 'ushort'],
  [AmqpTypeCode.uuid, 'uuid'],
]);

export function readAmqpTypeCode(typeName: Amqp1Dot0TypeName): number {
  return TYPE_CODE[typeName];
}

export function readAmqpTypeName(typeCode: number): Amqp1Dot0TypeName {
  const typeName: Amqp1Dot0TypeName | undefined = TYPE_NAME.get(typeCode);

  if (typeName === undefined) {
    throw new Error(`Unsupported AMQP 1.0 type code "${String(typeCode)}"`);
  }

  return typeName;
}
