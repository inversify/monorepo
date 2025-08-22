import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class PartialContentResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.PARTIAL_CONTENT, body);
  }
}
