import { HttpStatusCode } from '../HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class MultiStatusHttpResponse extends SuccessHttpResponse {
  constructor(body?: object | string | number | boolean) {
    super(HttpStatusCode.MULTI_STATUS, body);
  }
}
