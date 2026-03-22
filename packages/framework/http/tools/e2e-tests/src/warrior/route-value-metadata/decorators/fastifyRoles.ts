import { createRouteValueMetadataUtils } from '@inversifyjs/http-fastify';
import { type FastifyRequest } from 'fastify';

import { rolesMetadataKey } from '../models/rolesMetadataKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: FastifyRequest) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>(rolesMetadataKey);
