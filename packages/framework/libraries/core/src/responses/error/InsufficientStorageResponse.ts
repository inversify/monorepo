import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class InsufficientStorageResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Insufficient Storage',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.INSUFFICIENT_STORAGE, error, message, errorOptions);
  }
}
