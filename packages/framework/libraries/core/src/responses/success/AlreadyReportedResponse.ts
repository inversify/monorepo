import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class AlreadyReportedResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.ALREADY_REPORTED, body);
  }
}
