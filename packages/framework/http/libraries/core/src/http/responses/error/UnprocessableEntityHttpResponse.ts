import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class UnprocessableEntityHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Unprocessable Entity',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.UNPROCESSABLE_ENTITY, error, message, errorOptions);
  }
}
