import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class MultiStatusResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.MULTI_STATUS, body);
  }
}
