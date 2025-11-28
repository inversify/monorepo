import { Readable } from 'node:stream';

import { stringifyMessageEvent } from '../../sse/calculations/stringifyMessageEvent';
import { MessageEvent } from '../../sse/models/MessageEvent';

const isSseStreamSymbol: unique symbol = Symbol.for(
  '@inversifyjs/http-sse/SseStream',
);

export class SseStream extends Readable {
  public readonly [isSseStreamSymbol]: boolean = true;
  #readyPromise: Promise<void> | null = null;
  #readyResolve: (() => void) | null = null;

  public static is(value: unknown): value is SseStream {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Partial<SseStream>)[isSseStreamSymbol] === true
    );
  }

  public override _read(_size: number): void {
    if (this.#readyResolve !== null) {
      this.#readyResolve();
      this.#readyResolve = null;
      this.#readyPromise = null;
    }
  }

  public async writeMessageEvent(event: MessageEvent): Promise<void> {
    // Wait for any existing backpressure to resolve before pushing
    if (this.#readyPromise !== null) {
      await this.#readyPromise;
    }

    const canContinue: boolean = this.push(stringifyMessageEvent(event));

    if (canContinue) {
      return;
    }

    // Buffer is full, wait for _read() to be called
    this.#readyPromise = new Promise<void>((resolve: () => void) => {
      this.#readyResolve = resolve;
    });

    return this.#readyPromise;
  }

  public end(): void {
    this.push(null);
  }
}
