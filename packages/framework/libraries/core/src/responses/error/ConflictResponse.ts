import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class ConflictResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Conflict',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.CONFLICT, error, message, errorOptions);
  }
}
