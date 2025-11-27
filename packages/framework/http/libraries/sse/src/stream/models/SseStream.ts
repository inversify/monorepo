import { Readable } from 'node:stream';

import { stringifyMessageEvent } from '../../sse/calculations/stringifyMessageEvent';
import { MessageEvent } from '../../sse/models/MessageEvent';

const isSseStreamSymbol: unique symbol = Symbol.for(
  '@inversifyjs/http-sse/SseStream',
);

export class SseStream extends Readable {
  public readonly [isSseStreamSymbol]: boolean = true;

  public static is(value: unknown): value is SseStream {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Partial<SseStream>)[isSseStreamSymbol] === true
    );
  }

  public override _read(_size: number): void {
    // Do nothing
  }

  public writeMessageEvent(event: MessageEvent): boolean {
    return this.push(stringifyMessageEvent(event));
  }

  public end(): void {
    this.push(null);
  }
}
