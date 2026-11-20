import { type Amqp1Dot0Value } from './Amqp1Dot0Value.js';

/**
 * An AMQP 1.0 map. Entries stay in order, and a key keeps its AMQP type.
 */
export interface Amqp1Dot0Map {
  readonly entries: readonly (readonly [Amqp1Dot0Value, Amqp1Dot0Value])[];
  readonly kind: 'map';
}
