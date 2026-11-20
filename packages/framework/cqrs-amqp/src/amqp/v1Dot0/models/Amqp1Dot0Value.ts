import { type Amqp1Dot0Array } from './Amqp1Dot0Array.js';
import { type Amqp1Dot0DescribedValue } from './Amqp1Dot0DescribedValue.js';
import { type Amqp1Dot0List } from './Amqp1Dot0List.js';
import { type Amqp1Dot0Map } from './Amqp1Dot0Map.js';
import { type Amqp1Dot0SimpleValue } from './Amqp1Dot0SimpleValue.js';

/**
 * An AMQP 1.0 value.
 *
 * A list, a map, and an array each have their own `kind`. A described value
 * uses `kind: 'described'`.
 */
export type Amqp1Dot0Value =
  | Amqp1Dot0Array
  | Amqp1Dot0DescribedValue
  | Amqp1Dot0List
  | Amqp1Dot0Map
  | Amqp1Dot0SimpleValue;
