import { Middleware } from '@inversifyjs/http-core';
import express from 'express';

export type ExpressMiddleware = Middleware<
  express.Request,
  express.Response,
  express.NextFunction,
  void
>;
