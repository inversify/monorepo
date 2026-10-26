import { type HttpError } from '../models/HttpError.js';
import { ErrorTraceFixtures } from './ErrorTraceFixtures.js';

export class HttpErrorFixtures {
  public static get any(): HttpError {
    return {
      endedAt: new Date('2026-01-01T00:00:02.000Z'),
      error: { message: 'boom' },
      errorTraces: [ErrorTraceFixtures.any],
      filter: 'InversifyValidationErrorFilter',
      id: 'http-error-id',
      startedAt: new Date('2026-01-01T00:00:01.000Z'),
    };
  }
}
