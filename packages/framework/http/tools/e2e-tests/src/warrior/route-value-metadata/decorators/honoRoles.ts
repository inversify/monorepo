import { createRouteValueMetadataUtils } from '@inversifyjs/http-hono';
import { type HonoRequest } from 'hono';

import { rolesMetadataKey } from '../models/rolesMetadataKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: HonoRequest) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>(rolesMetadataKey);
