import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class ServiceUnavailableResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Service Unavailable',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.SERVICE_UNAVAILABLE, error, message, errorOptions);
  }
}
