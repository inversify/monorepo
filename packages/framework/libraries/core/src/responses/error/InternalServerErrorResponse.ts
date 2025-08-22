import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class InternalServerErrorResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Internal Server Error',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.INTERNAL_SERVER_ERROR, error, message, errorOptions);
  }
}
