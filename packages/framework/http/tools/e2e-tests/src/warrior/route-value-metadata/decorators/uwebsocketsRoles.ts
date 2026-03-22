import { createRouteValueMetadataUtils } from '@inversifyjs/http-uwebsockets';
import { type HttpRequest } from 'uWebSockets.js';

import { rolesMetadataKey } from '../models/rolesMetadataKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: HttpRequest) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>(rolesMetadataKey);
