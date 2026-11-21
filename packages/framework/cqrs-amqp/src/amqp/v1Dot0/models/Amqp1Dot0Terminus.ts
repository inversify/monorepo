import { type Amqp1Dot0TerminusDurability } from './Amqp1Dot0TerminusDurability.js';
import { type Amqp1Dot0TerminusExpiryPolicy } from './Amqp1Dot0TerminusExpiryPolicy.js';

/**
 * Settings shared by link sources and targets. The address always comes from
 * the transport declaration.
 */
export interface Amqp1Dot0Terminus {
  readonly capabilities?: readonly string[];
  /**
   * Defaults to `none`.
   */
  readonly durable?: Amqp1Dot0TerminusDurability;
  /**
   * Defaults to `sessionEnd`.
   */
  readonly expiryPolicy?: Amqp1Dot0TerminusExpiryPolicy;
  /**
   * Seconds an expiring terminus is retained. Defaults to 0.
   */
  readonly timeout?: number;
}
