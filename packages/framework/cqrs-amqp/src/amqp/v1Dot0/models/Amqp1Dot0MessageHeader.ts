export interface Amqp1Dot0MessageHeader {
  readonly deliveryCount?: number;
  readonly durable?: boolean;
  readonly firstAcquirer?: boolean;
  readonly priority?: number;
  /**
   * Time to live, in milliseconds.
   */
  readonly ttl?: number;
}
