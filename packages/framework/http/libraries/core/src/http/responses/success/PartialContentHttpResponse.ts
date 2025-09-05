import { HttpStatusCode } from '../HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class PartialContentHttpResponse extends SuccessHttpResponse {
  constructor(body?: object | string | number | boolean) {
    super(HttpStatusCode.PARTIAL_CONTENT, body);
  }
}
