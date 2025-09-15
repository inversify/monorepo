import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class ConflictHttpResponse extends ErrorHttpResponse {
  constructor(
    message?: string,
    error: string = 'Conflict',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.CONFLICT, error, message, errorOptions);
  }
}
