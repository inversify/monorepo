import fs from 'node:fs';
import path from 'node:path';

import {
  Controller,
  Get,
  Params,
  Response,
  SetHeader,
} from '@inversifyjs/http-core';
import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { FastifyReply } from 'fastify';
import { Newable } from 'inversify';
import mime from 'mime-types';

import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';

export function buildSwaggerUiFastifyController(
  options: SwaggerUiProviderOptions,
): Newable<BaseSwaggerUiController<FastifyReply, void | Promise<void>>> {
  @Controller(options.api.path)
  class SwaggerUiFastifyController extends BaseSwaggerUiController<
    FastifyReply,
    void | Promise<void>
  > {
    constructor() {
      super(options);
    }

    @Get()
    @SetHeader('Content-Type', 'text/html')
    public override getSwaggerUi(): string {
      return super.getSwaggerUi();
    }

    @Get('/spec')
    public override getOpenApiObject(): OpenApi3Dot1Object {
      return super.getOpenApiObject();
    }

    @Get('/resources/swagger-ui-init.js')
    @SetHeader('Content-Type', 'text/javascript')
    public override getSwaggerUiInitJs(): string {
      return super.getSwaggerUiInitJs();
    }

    @Get('/resources/:resource')
    public override async getSwaggerUiResource(
      @Params('resource') resource: string,
      @Response()
      response: FastifyReply,
    ): Promise<void> {
      return super.getSwaggerUiResource(resource, response);
    }

    protected _sendFile(
      response: FastifyReply,
      rootPath: string,
      filePath: string,
    ): void {
      const mimeType: string | false = mime.lookup(filePath);

      if (mimeType !== false) {
        response.type(mimeType);
      }

      const fullPath: string = path.join(rootPath, filePath);

      const stream: fs.ReadStream = fs.createReadStream(fullPath);

      response.send(stream);
    }
  }

  return SwaggerUiFastifyController;
}
