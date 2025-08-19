import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class ForbiddenHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Forbidden',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.FORBIDDEN, error, message, errorOptions);
  }
}
