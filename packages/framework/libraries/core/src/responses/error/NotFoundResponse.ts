import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class NotFoundResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Not Found',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.NOT_FOUND, error, message, errorOptions);
  }
}
