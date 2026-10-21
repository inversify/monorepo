import { type Controller } from '../../../../generated/prisma/client.js';

export class PrismaControllerFixtures {
  public static get any(): Controller {
    return {
      call_id: 'call-id',
      controller: 'FooController',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:03.000Z'),
      error: { message: 'boom' },
      id: 'controller-id',
      method: 'getFoo',
      started_at: new Date('2026-01-01T00:00:02.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
