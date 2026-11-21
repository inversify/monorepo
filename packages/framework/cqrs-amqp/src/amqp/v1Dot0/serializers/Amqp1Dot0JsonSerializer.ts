import { randomUUID } from 'node:crypto';

import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { type Amqp1Dot0Serializer } from '../models/Amqp1Dot0Serializer.js';

export class Amqp1Dot0JsonSerializer implements Amqp1Dot0Serializer {
  public serialize(command: object): Amqp1Dot0Message {
    return {
      body: {
        kind: 'data',
        sections: [Buffer.from(JSON.stringify(command), 'utf8')],
      },
      header: { durable: true },
      properties: {
        contentType: 'application/json',
        messageId: randomUUID(),
      },
    };
  }
}
