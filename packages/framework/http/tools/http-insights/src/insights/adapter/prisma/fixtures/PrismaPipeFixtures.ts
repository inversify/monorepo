import { type Pipe } from '../../../../generated/prisma/client.js';

export class PrismaPipeFixtures {
  public static get any(): Pipe {
    return {
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      id: 'pipe-id',
      method: 'getFoo',
      parameter_index: 0,
      pipe: 'StandardSchemaValidationPipe',
      started_at: new Date('2026-01-01T00:00:01.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
