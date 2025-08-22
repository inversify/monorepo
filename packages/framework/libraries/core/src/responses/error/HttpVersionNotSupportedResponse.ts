import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

export class HttpVersionNotSupportedResponse extends ErrorResponse {
  constructor(
    message?: string,
    error: string = 'HTTP Version Not Supported',
    errorOptions?: ErrorOptions,
  ) {
    super(StatusCode.HTTP_VERSION_NOT_SUPPORTED, error, message, errorOptions);
  }
}
