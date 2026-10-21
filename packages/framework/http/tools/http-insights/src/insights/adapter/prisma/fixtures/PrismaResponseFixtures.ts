import { type Response } from '../../../../generated/prisma/client.js';

export class PrismaResponseFixtures {
  public static get any(): Response {
    return {
      aborted: false,
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      headers: { 'content-type': 'application/json' },
      id: 'response-id',
      sent_at: new Date('2026-01-01T00:00:04.000Z'),
      status_code: 200,
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
