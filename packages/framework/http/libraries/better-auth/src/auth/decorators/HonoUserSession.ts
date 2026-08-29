import { createCustomParameterMethodDecorator } from '@inversifyjs/http-core';

import { buildUserSessionFromHonoRequest } from '../calculations/buildUserSessionFromHonoRequest.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HonoUserSession(
  paramName: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return createCustomParameterMethodDecorator(
    buildUserSessionFromHonoRequest,
  )(paramName);
}
