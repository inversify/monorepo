import { type Amqp1Dot0Value } from './Amqp1Dot0Value.js';

/**
 * An AMQP 1.0 described value: a descriptor plus the value it describes.
 *
 * The descriptor is usually a symbol or an unsigned long. A symbol is a
 * string, an unsigned long is a number, and a descriptor that is itself
 * described is a described value.
 */
export interface Amqp1Dot0DescribedValue {
  readonly descriptor: Amqp1Dot0Value;
  readonly kind: 'described';
  readonly value: Amqp1Dot0Value;
}
