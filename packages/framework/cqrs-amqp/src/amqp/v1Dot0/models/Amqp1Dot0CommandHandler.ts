import { type CqrsCommandHandler } from '@inversifyjs/framework-cqrs';

import { type Amqp1Dot0Message } from './Amqp1Dot0Message.js';

export interface Amqp1Dot0CommandHandler<
  TCommand extends object = object,
> extends CqrsCommandHandler<TCommand> {
  /**
   * Builds the command carried by a received message.
   *
   * Returning `undefined` skips this handler for the message, which lets
   * handlers sharing an address ignore messages meant for other handlers.
   */
  deserialize(
    message: Amqp1Dot0Message,
  ): Promise<TCommand | undefined> | TCommand | undefined;
}
