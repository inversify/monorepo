import { type Logger } from '@inversifyjs/logger';

import { type Amqp1Dot0ConnectionConfig } from './Amqp1Dot0ConnectionConfig.js';
import { type Amqp1Dot0HandlerErrorOutcome } from './Amqp1Dot0HandlerErrorOutcome.js';
import { type Amqp1Dot0Serializer } from './Amqp1Dot0Serializer.js';

export interface Amqp1Dot0TransportProviderOptions {
  connections: Iterable<Amqp1Dot0ConnectionConfig>;
  handlerErrorOutcome?: Amqp1Dot0HandlerErrorOutcome;
  listenersEnabled?: boolean;
  logger?: boolean | Logger;
  /**
   * Maximum time, in milliseconds, a send waits for its sender, for credit,
   * and for the peer outcome. A send that times out may still reach the
   * peer. No timeout by default. Node cannot schedule a timer longer than
   * 2147483647 milliseconds, and a larger value is rejected rather than
   * shortened.
   */
  sendTimeout?: number;
  serializer?: Amqp1Dot0Serializer;
}
