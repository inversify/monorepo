import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class ResetContentResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.RESET_CONTENT, body);
  }
}
