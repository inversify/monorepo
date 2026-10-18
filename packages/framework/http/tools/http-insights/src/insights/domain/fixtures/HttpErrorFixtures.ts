import { type HttpError } from '../models/HttpError.js';

export class HttpErrorFixtures {
  public static get any(): HttpError {
    return {
      endedAt: new Date('2026-01-01T00:00:02.000Z'),
      error: { message: 'boom' },
      filter: 'InversifyValidationErrorFilter',
      id: 'http-error-id',
      startedAt: new Date('2026-01-01T00:00:01.000Z'),
    };
  }
}
