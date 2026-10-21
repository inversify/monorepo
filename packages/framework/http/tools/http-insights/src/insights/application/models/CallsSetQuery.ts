import { type HttpError } from '../../domain/models/HttpError.js';

export interface CallsSetQuery {
  readonly httpErrors: readonly HttpError[];
}
