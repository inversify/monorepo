import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class InsufficientStorageHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Insufficient Storage',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.INSUFFICIENT_STORAGE, error, message, errorOptions);
  }
}
