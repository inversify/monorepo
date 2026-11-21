import { type Amqp1Dot0Source } from './Amqp1Dot0Source.js';

export interface Amqp1Dot0ReceiverOptions {
  /**
   * Maximum number of messages being handled at once on each listened
   * address. A credit is returned to the peer every time a message is
   * settled, not when it arrives. Defaults to 100.
   */
  readonly creditWindow?: number;
  readonly source?: Amqp1Dot0Source;
}
