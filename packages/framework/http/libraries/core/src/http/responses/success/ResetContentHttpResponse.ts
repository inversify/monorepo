import { HttpStatusCode } from '../HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class ResetContentHttpResponse extends SuccessHttpResponse {
  constructor(body?: object | string | number | boolean) {
    super(HttpStatusCode.RESET_CONTENT, body);
  }
}
