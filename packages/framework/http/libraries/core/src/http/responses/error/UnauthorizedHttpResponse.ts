import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class UnauthorizedHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Unauthorized',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.UNAUTHORIZED, error, message, errorOptions);
  }
}
