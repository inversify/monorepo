import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class MethodNotAllowedHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Method Not Allowed',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.METHOD_NOT_ALLOWED, error, message, errorOptions);
  }
}
