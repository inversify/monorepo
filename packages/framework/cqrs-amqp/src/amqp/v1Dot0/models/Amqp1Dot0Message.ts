import { type Amqp1Dot0MessageBody } from './Amqp1Dot0MessageBody.js';
import { type Amqp1Dot0MessageHeader } from './Amqp1Dot0MessageHeader.js';
import { type Amqp1Dot0MessageProperties } from './Amqp1Dot0MessageProperties.js';
import { type Amqp1Dot0Value } from './Amqp1Dot0Value.js';

export interface Amqp1Dot0Message {
  /**
   * The spec restricts these values to simple types. Whatever arrives is
   * preserved, including lists, maps, and described values.
   */
  readonly applicationProperties?: Readonly<Record<string, Amqp1Dot0Value>>;
  readonly body: Amqp1Dot0MessageBody;
  /**
   * Annotation map. Keys are strings here; AMQP encodes them as symbols.
   */
  readonly deliveryAnnotations?: Readonly<Record<string, Amqp1Dot0Value>>;
  readonly footer?: Readonly<Record<string, Amqp1Dot0Value>>;
  readonly header?: Amqp1Dot0MessageHeader;
  /**
   * Annotation map. Keys are strings here; AMQP encodes them as symbols.
   */
  readonly messageAnnotations?: Readonly<Record<string, Amqp1Dot0Value>>;
  readonly properties?: Amqp1Dot0MessageProperties;
}
