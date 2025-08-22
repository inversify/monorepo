import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class GatewayTimeoutResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Gateway Timeout',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.GATEWAY_TIMEOUT, error, message, errorOptions);
  }
}
