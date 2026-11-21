import { type Amqp1Dot0Value } from './Amqp1Dot0Value.js';

/**
 * An AMQP 1.0 list. Each item has its own type.
 */
export interface Amqp1Dot0List {
  readonly items: readonly Amqp1Dot0Value[];
  readonly kind: 'list';
}
