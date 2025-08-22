import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class BadGatewayResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Bad Gateway',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.BAD_GATEWAY, error, message, errorOptions);
  }
}
