import { type NativeMiddleware } from '../../../../generated/prisma/client.js';

export class PrismaNativeMiddlewareFixtures {
  public static get any(): NativeMiddleware {
    return {
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      execution_id: 'execution-id',
      id: 'native-middleware-id',
      name: 'jsonParser',
      started_at: new Date('2026-01-01T00:00:01.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
