import { type NativeMiddleware } from '../models/NativeMiddleware.js';

export class NativeMiddlewareFixtures {
  public static get any(): NativeMiddleware {
    return {
      endedAt: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      id: 'native-middleware-id',
      name: 'jsonParser',
      startedAt: new Date('2026-01-01T00:00:01.000Z'),
    };
  }
}
