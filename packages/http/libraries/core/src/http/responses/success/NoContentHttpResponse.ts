import { HttpStatusCode } from '../HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class NoContentHttpResponse extends SuccessHttpResponse {
  constructor() {
    super(HttpStatusCode.NO_CONTENT);
  }
}
