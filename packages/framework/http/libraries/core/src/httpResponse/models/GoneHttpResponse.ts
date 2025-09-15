import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class GoneHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Gone',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.GONE, error, message, errorOptions);
  }
}
