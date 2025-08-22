import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class UnauthorizedResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Unauthorized',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.UNAUTHORIZED, error, message, errorOptions);
  }
}
