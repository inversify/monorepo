import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class PaymentRequiredResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'Payment Required',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.PAYMENT_REQUIRED, error, message, errorOptions);
  }
}
