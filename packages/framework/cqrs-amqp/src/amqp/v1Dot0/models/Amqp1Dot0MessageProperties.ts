import { type Amqp1Dot0MessageId } from './Amqp1Dot0MessageId.js';

export interface Amqp1Dot0MessageProperties {
  readonly absoluteExpiryTime?: Date;
  readonly contentEncoding?: string;
  readonly contentType?: string;
  readonly correlationId?: Amqp1Dot0MessageId;
  readonly creationTime?: Date;
  readonly groupId?: string;
  readonly groupSequence?: number;
  readonly messageId?: Amqp1Dot0MessageId;
  readonly replyTo?: string;
  readonly replyToGroupId?: string;
  readonly subject?: string;
  readonly to?: string;
  readonly userId?: Uint8Array;
}
