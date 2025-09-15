import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class BadGatewayHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Bad Gateway',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.BAD_GATEWAY, error, message, errorOptions);
  }
}
