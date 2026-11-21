export interface CqrsHandler {
  handle(input: object): unknown;
}

export function isCqrsHandler(value: unknown): value is CqrsHandler {
  return (
    typeof value === 'object' &&
    value !== null &&
    'handle' in value &&
    typeof value.handle === 'function'
  );
}
