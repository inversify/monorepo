import { type Amqp1Dot0Filter } from './Amqp1Dot0Filter.js';
import { type Amqp1Dot0Terminus } from './Amqp1Dot0Terminus.js';

export interface Amqp1Dot0Source extends Amqp1Dot0Terminus {
  readonly distributionMode?: 'copy' | 'move';
  /**
   * Filters keyed by name.
   */
  readonly filters?: Readonly<Record<string, Amqp1Dot0Filter>>;
}
