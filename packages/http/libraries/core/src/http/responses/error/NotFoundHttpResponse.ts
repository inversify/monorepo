import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class NotFoundHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Not Found',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.NOT_FOUND, error, message, errorOptions);
  }
}
