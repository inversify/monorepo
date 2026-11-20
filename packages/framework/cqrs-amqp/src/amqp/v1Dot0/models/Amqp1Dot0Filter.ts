import { type Amqp1Dot0DescribedValue } from './Amqp1Dot0DescribedValue.js';

/**
 * A source filter is an AMQP described value. A JMS selector is
 * `{ kind: 'described', descriptor: 'apache.org:selector-filter:string', value: "color = 'red'" }`.
 */
export type Amqp1Dot0Filter = Amqp1Dot0DescribedValue;
