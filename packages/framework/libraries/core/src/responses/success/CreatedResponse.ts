import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

export class CreatedResponse extends SuccessResponse {
  constructor(body?: object | string | number | boolean) {
    super(StatusCode.CREATED, body);
  }
}
