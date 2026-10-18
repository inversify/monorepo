import { type Response } from '../models/Response.js';

export class ResponseFixtures {
  public static get any(): Response {
    return {
      aborted: false,
      headers: { 'content-type': 'application/json' },
      id: 'response-id',
      sentAt: new Date('2026-01-01T00:00:04.000Z'),
      statusCode: 200,
    };
  }
}
