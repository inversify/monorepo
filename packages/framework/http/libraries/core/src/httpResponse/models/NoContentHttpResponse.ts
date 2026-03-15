import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { SuccessHttpResponse } from './SuccessHttpResponse.js';

export class NoContentHttpResponse extends SuccessHttpResponse {
  constructor(headers?: Record<string, string>) {
    super(HttpStatusCode.NO_CONTENT, undefined, headers);
  }
}
