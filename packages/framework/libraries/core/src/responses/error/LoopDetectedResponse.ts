import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class LoopDetectedResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Loop Detected',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.LOOP_DETECTED, error, message, errorOptions);
  }
}
