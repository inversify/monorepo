/**
 * Reconnection with exponential backoff, applied once a connection has opened.
 */
export interface Amqp1Dot0ReconnectOptions {
  /**
   * Delay, in milliseconds, before the first attempt. Defaults to 100.
   */
  readonly initialDelay?: number;
  /**
   * Maximum number of consecutive attempts. Unlimited by default.
   */
  readonly limit?: number;
  /**
   * Maximum delay, in milliseconds, between attempts. Defaults to 60000.
   */
  readonly maxDelay?: number;
}
