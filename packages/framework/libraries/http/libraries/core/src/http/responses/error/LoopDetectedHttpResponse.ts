import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class LoopDetectedHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Loop Detected',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.LOOP_DETECTED, error, message, errorOptions);
  }
}
