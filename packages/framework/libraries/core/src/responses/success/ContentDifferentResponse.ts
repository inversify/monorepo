import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class ContentDifferentResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.CONTENT_DIFFERENT, body);
  }
}
