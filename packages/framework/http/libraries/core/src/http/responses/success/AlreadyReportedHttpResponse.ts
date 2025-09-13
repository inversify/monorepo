import { HttpStatusCode } from '../HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class AlreadyReportedHttpResponse extends SuccessHttpResponse {
  constructor(body?: object | string | number | boolean) {
    super(HttpStatusCode.ALREADY_REPORTED, body);
  }
}
