import { type Middleware } from '@inversifyjs/http-core';
import type express from 'express';

export type ExpressMiddleware = Middleware<
  express.Request,
  express.Response,
  express.NextFunction,
  void
>;
