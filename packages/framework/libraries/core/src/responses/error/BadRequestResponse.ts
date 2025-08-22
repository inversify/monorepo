import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class BadRequestResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Bad Request',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.BAD_REQUEST, error, message, errorOptions);
  }
}
