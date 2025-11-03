import { Guard } from '@inversifyjs/http-core';
import { HttpRequest } from 'uWebSockets.js';

export type UwebSocketsGuard = Guard<HttpRequest>;
