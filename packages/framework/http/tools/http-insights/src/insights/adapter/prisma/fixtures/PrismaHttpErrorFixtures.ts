import { type HttpError } from '../../../../generated/prisma/client.js';

export class PrismaHttpErrorFixtures {
  public static get any(): HttpError {
    return {
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:02.000Z'),
      error: { message: 'boom' },
      filter: 'InversifyValidationErrorFilter',
      id: 'http-error-id',
      started_at: new Date('2026-01-01T00:00:01.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
