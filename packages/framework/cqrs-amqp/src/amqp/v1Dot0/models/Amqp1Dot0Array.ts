import { type Amqp1Dot0TypeName } from './Amqp1Dot0TypeName.js';
import { type Amqp1Dot0Value } from './Amqp1Dot0Value.js';

/**
 * An AMQP 1.0 array. Every item shares `elementType`. When the items are
 * described, the descriptor is stored once in `elementDescriptor`.
 */
export interface Amqp1Dot0Array {
  readonly elementDescriptor?: Amqp1Dot0Value;
  readonly elementType: Amqp1Dot0TypeName;
  readonly items: readonly Amqp1Dot0Value[];
  readonly kind: 'array';
}
