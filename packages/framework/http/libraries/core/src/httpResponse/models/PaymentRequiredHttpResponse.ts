import Stream from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class PaymentRequiredHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.PAYMENT_REQUIRED, body, errorMessage, errorOptions);
  }
}
