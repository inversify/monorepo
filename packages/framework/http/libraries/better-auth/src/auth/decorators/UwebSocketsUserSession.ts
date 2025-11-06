import { createCustomParameterDecorator } from '@inversifyjs/http-core';

import { buildUserSessionFromUwebSocketsRequest } from '../calculations/buildUserSessionFromUwebSocketsRequest';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UwebSocketsUserSession(): ParameterDecorator {
  return createCustomParameterDecorator(buildUserSessionFromUwebSocketsRequest);
}
