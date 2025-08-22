import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class NonAuthoritativeInformationResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.NON_AUTHORITATIVE_INFORMATION, body);
  }
}
