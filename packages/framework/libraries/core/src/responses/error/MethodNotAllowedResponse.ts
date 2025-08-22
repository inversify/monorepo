import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class MethodNotAllowedResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Method Not Allowed',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.METHOD_NOT_ALLOWED, error, message, errorOptions);
  }
}
