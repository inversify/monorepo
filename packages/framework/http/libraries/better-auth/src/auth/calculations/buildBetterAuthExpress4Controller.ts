import { type IncomingMessage, type ServerResponse } from 'node:http';

import {
  All,
  Controller,
  type RequestParam,
  type ResponseParam,
} from '@inversifyjs/http-core';
import { type BetterAuthOptions } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import type express from 'express4';
import { type Newable } from 'inversify';
import { type Reflect as Inject, type WithReflectMetadata as Injectable } from 'rflct';

import { type BetterAuth } from '../models/BetterAuth.js';

export function buildBetterAuthExpress4Controller(
  basePath: string,
  serviceIdentifier: symbol,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier,
  })
  class BetterAuthExpress4Controller<TOptions extends BetterAuthOptions>
    implements Injectable
  {
    readonly #handler: (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<void>;

    constructor(
      auth: Inject<BetterAuth<TOptions>>,
    ) {
      this.#handler = toNodeHandler(auth);
    }

    @All('/*')
    public async handle(
      req: RequestParam<express.Request>,
      res: ResponseParam<express.Response>,
    ): Promise<void> {
      await this.#handler(req, res);
    }
  }

  return BetterAuthExpress4Controller;
}
