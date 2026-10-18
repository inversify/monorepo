import { type Pipe } from '../models/Pipe.js';

export class PipeFixtures {
  public static get any(): Pipe {
    return {
      endedAt: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      id: 'pipe-id',
      method: 'getFoo',
      parameterIndex: 0,
      pipe: 'StandardSchemaValidationPipe',
      startedAt: new Date('2026-01-01T00:00:01.000Z'),
    };
  }
}
