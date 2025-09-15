import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class ServiceUnavailableHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Service Unavailable',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.SERVICE_UNAVAILABLE, error, message, errorOptions);
  }
}
