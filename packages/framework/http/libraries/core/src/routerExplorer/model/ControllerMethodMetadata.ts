import { type RequestMethodType } from '../../http/models/RequestMethodType.js';

export interface ControllerMethodMetadata {
  path: string;
  requestMethodType: RequestMethodType;
  methodKey: string | symbol;
}
