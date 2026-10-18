import { type Request } from '../models/Request.js';

export class RequestFixtures {
  public static get any(): Request {
    return {
      headers: { accept: ['text/html', 'application/json'], host: 'foo.com' },
      id: 'request-id',
      method: 'GET',
      startedAt: new Date('2026-01-01T00:00:00.000Z'),
      url: '/foo',
    };
  }
}
