import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class ContentDifferentHttpResponse extends SuccessHttpResponse {
  constructor(body?: object | string | number | boolean) {
    super(HttpStatusCode.CONTENT_DIFFERENT, body);
  }
}
