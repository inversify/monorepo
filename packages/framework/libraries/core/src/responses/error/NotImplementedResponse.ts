import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class NotImplementedResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Not Implemented',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.NOT_IMPLEMENTED, error, message, errorOptions);
  }
}
