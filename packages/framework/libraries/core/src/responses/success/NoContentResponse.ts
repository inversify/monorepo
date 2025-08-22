import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class NoContentResponse extends SuccessResponse {
  constructor() {
    super(StatusCode.NO_CONTENT);
  }
}
