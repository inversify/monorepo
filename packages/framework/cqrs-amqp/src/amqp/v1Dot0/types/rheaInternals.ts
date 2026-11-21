import type { Delivery } from 'rhea';

import type { RheaSendableMessage } from '../calculations/buildRheaMessage.js';

// Fields rhea reads and writes that its published types leave out. The
// package is pinned to rhea 3.0.5 because these are internals.
declare module 'rhea' {
  interface Connection {
    _is_fatal(condition: string): boolean;
    _register(): void;
    abort_socket(socket: unknown): void;
    scheduled_reconnect: ReturnType<typeof setTimeout> | undefined;
    set_reconnect(reconnect: boolean | number): void;
    socket: unknown;
  }

  interface link {
    credit: number;
  }

  // Written before the attach frame is sent. `rcv_settle_mode` on the link is
  // only copied from here while the link is constructed.
  interface Receiver {
    readonly local: {
      attach: {
        rcv_settle_mode: 0 | 1;
      };
    };
  }

  interface Sender {
    send(
      msg: RheaSendableMessage,
      tag?: Buffer | string,
      format?: number,
    ): Delivery;
  }

  interface SenderOptions {
    treat_modified_as_released?: boolean;
  }

  interface Session {
    outgoing?: {
      next_pending_delivery?: number;
    };
  }
}
