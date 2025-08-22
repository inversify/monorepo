import { isResponse as isResponseSymbol, Response } from '../Response';

export function isResponse(value: unknown): value is Response {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<Response>)[isResponseSymbol] === true
  );
}
