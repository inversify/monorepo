import { type Guard } from '@inversifyjs/http-core';
import { type HonoRequest } from 'hono';

export type HonoGuard = Guard<HonoRequest>;
