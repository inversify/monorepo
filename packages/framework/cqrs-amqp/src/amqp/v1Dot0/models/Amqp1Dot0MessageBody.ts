import { type Amqp1Dot0List } from './Amqp1Dot0List.js';
import { type Amqp1Dot0Value } from './Amqp1Dot0Value.js';

/**
 * The body of an AMQP 1.0 message. Each data or sequence section is kept,
 * in order. A value section is a single AMQP value.
 */
export type Amqp1Dot0MessageBody =
  | {
      readonly kind: 'data';
      readonly sections: readonly Uint8Array[];
    }
  | {
      readonly kind: 'sequence';
      readonly sections: readonly Amqp1Dot0List[];
    }
  | {
      readonly kind: 'value';
      readonly value: Amqp1Dot0Value;
    };
