import { type IncomingMessage, type ServerResponse } from 'node:http';

import { All, Controller, Request, Response } from '@inversifyjs/http-core';
import { type BetterAuthOptions } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import type express from 'express4';
import { inject, type Newable } from 'inversify';

import { type BetterAuth } from '../models/BetterAuth.js';
import { betterAuthServiceIdentifier } from '../models/betterAuthServiceIdentifier.js';

export function buildBetterAuthExpress4Controller(
  basePath: string,
  serviceIdentifier: symbol,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier,
  })
  class BetterAuthExpress4Controller<TOptions extends BetterAuthOptions> {
    readonly #handler: (
      req: IncomingMessage,
      res: ServerResponse,
    ) => Promise<void>;

    constructor(
      @inject(betterAuthServiceIdentifier)
      auth: BetterAuth<TOptions>,
    ) {
      this.#handler = toNodeHandler(auth);
    }

    @All('/*')
    public async handle(
      @Request() req: express.Request,
      @Response() res: express.Response,
    ): Promise<void> {
      await this.#handler(req, res);
    }
  }

  return BetterAuthExpress4Controller;
}
