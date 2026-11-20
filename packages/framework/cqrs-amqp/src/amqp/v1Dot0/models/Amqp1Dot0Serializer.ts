import { type Amqp1Dot0Message } from './Amqp1Dot0Message.js';

export interface Amqp1Dot0Serializer {
  serialize(command: object): Amqp1Dot0Message;
}
