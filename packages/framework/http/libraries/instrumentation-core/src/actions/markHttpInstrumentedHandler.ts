import { httpInstrumentedHandlerSymbol } from '../models/httpInstrumentedHandlerSymbol.js';

export function markHttpInstrumentedHandler(handler: object): void {
  Object.defineProperty(handler, httpInstrumentedHandlerSymbol, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });
}

export function isHttpInstrumentedHandler(handler: object): boolean {
  const record: Record<symbol, unknown> = handler as Record<symbol, unknown>;

  return record[httpInstrumentedHandlerSymbol] === true;
}
