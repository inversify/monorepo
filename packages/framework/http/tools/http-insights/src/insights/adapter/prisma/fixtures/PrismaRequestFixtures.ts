import { type Request } from '../../../../generated/prisma/client.js';

export class PrismaRequestFixtures {
  public static get any(): Request {
    return {
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      headers: { accept: ['text/html', 'application/json'], host: 'foo.com' },
      id: 'request-id',
      method: 'GET',
      started_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
      url: '/foo',
    };
  }
}
