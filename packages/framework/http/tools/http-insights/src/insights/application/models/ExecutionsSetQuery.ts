import { type HttpError } from '../../domain/models/HttpError.js';

export interface ExecutionsSetQuery {
  readonly httpErrors: readonly HttpError[];
}
