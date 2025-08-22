import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class ForbiddenResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Forbidden',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.FORBIDDEN, error, message, errorOptions);
  }
}
