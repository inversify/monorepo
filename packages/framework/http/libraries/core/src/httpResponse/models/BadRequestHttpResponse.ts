import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class BadRequestHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Bad Request',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.BAD_REQUEST, error, message, errorOptions);
  }
}
