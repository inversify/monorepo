import { requestMethod } from '../calculations/requestMethod';
import { RequestMethodType } from '../models/RequestMethodType';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Head: (path?: string) => MethodDecorator = (
  path?: string,
): MethodDecorator => requestMethod(RequestMethodType.Head, path);
