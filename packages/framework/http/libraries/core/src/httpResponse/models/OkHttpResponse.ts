import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class OkHttpResponse extends SuccessHttpResponse {
  constructor(body?: object | string | number | boolean) {
    super(HttpStatusCode.OK, body);
  }
}
