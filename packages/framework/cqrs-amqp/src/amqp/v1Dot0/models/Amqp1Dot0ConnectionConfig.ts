import { type Amqp1Dot0ConnectionOptions } from './Amqp1Dot0ConnectionOptions.js';
import { type Amqp1Dot0ReceiverOptions } from './Amqp1Dot0ReceiverOptions.js';
import { type Amqp1Dot0SenderOptions } from './Amqp1Dot0SenderOptions.js';
import { type Amqp1Dot0Serializer } from './Amqp1Dot0Serializer.js';

export interface Amqp1Dot0ConnectionConfig {
  connectionOptions: Amqp1Dot0ConnectionOptions;
  identifier: string | symbol;
  listenersEnabled?: boolean;
  receiverOptions?: Amqp1Dot0ReceiverOptions;
  senderOptions?: Amqp1Dot0SenderOptions;
  serializers?: ReadonlyMap<string, Amqp1Dot0Serializer>;
}
