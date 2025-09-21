import { createCustomParameterDecorator } from '@inversifyjs/http-core';

import { buildUserSessionFromHonoRequest } from '../calculations/buildUserSessionFromHonoRequest';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HonoUserSession(): ParameterDecorator {
  return createCustomParameterDecorator(buildUserSessionFromHonoRequest);
}
