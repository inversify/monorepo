import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class GoneResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Gone',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.GONE, error, message, errorOptions);
  }
}
