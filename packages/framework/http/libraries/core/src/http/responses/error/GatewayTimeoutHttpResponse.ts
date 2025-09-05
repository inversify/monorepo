import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class GatewayTimeoutHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Gateway Timeout',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.GATEWAY_TIMEOUT, error, message, errorOptions);
  }
}
