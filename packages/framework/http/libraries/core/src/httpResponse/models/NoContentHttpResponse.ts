import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class NoContentHttpResponse extends SuccessHttpResponse {
  constructor(headers?: Record<string, string>) {
    super(HttpStatusCode.NO_CONTENT, undefined, headers);
  }
}
