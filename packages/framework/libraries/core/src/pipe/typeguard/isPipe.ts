import { Pipe } from '../models/Pipe';

export function isPipe(value: unknown): value is Pipe {
  const pipe: Partial<Pipe> = value as Partial<Pipe>;

  return (
    value !== undefined &&
    value !== null &&
    typeof pipe === 'object' &&
    typeof pipe.execute === 'function'
  );
}
