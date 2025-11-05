import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { SuccessHttpResponse } from './SuccessHttpResponse';

export class AlreadyReportedHttpResponse extends SuccessHttpResponse {
  constructor(
    body?: object | string | number | boolean,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.ALREADY_REPORTED, body, headers);
  }
}
