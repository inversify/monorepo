import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class OkResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.OK, body);
  }
}
