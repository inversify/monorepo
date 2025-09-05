import { RequestMethodType } from '../../http/models/RequestMethodType';

export interface ControllerMethodMetadata {
  path: string;
  requestMethodType: RequestMethodType;
  methodKey: string | symbol;
}
