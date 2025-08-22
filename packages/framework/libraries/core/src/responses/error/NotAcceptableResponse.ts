import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class NotAcceptableResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Not Acceptable',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.NOT_ACCEPTABLE, error, message, errorOptions);
  }
}
