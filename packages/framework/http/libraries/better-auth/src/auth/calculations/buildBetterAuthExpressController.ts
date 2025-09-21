import { IncomingMessage, ServerResponse } from 'node:http';

import { All, Controller, Request, Response } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import express from 'express';
import { inject, Newable } from 'inversify';

import { BetterAuth } from '../models/BetterAuth';
import { betterAuthControllerServiceIdentifier } from '../models/betterAuthControllerServiceIdentifier';
import { betterAuthServiceIdentifier } from '../models/betterAuthServiceIdentifier';

export function buildBetterAuthExpressController(
  basePath: string,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier: betterAuthControllerServiceIdentifier,
  })
  class BetterAuthExpressController<TOptions extends BetterAuthOptions> {
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

    @All('/{*any}')
    public async handle(
      @Request() req: express.Request,
      @Response() res: express.Response,
    ): Promise<void> {
      await this.#handler(req, res);
    }
  }

  return BetterAuthExpressController;
}
