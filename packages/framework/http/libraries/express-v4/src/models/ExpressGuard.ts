import { type Guard } from '@inversifyjs/http-core';
import type express from 'express';

export type ExpressGuard = Guard<express.Request>;
