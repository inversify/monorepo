import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class PaymentRequiredHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Payment Required',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.PAYMENT_REQUIRED, error, message, errorOptions);
  }
}
