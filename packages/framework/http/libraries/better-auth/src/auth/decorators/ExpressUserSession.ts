import { createCustomParameterMethodDecorator } from '@inversifyjs/http-core';

import { buildUserSessionFromExpressRequest } from '../calculations/buildUserSessionFromExpressRequest.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ExpressUserSession(
  paramName: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return createCustomParameterMethodDecorator(
    buildUserSessionFromExpressRequest,
  )(paramName);
}
