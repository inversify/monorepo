import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

import {
  Controller,
  Get,
  Params,
  Response,
  SetHeader,
} from '@inversifyjs/http-core';
import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Context } from 'hono';
import { stream } from 'hono/streaming';
import { StreamingApi } from 'hono/utils/stream';
import { Newable } from 'inversify';
import mime from 'mime-types';

import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';

export function buildSwaggerUiHonoController(
  options: SwaggerUiProviderOptions,
): Newable<BaseSwaggerUiController<Context, Response | undefined>> {
  @Controller(options.api.path)
  class SwaggerUiHonoController extends BaseSwaggerUiController<
    Context,
    Response | undefined
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
    public override getSwaggerUiResource(
      @Params('resource') resource: string,
      @Response()
      context: Context,
    ): Response | undefined {
      return super.getSwaggerUiResource(resource, context);
    }

    protected _sendFile(
      context: Context,
      rootPath: string,
      filePath: string,
    ): Response | undefined {
      const mimeType: string | false = mime.lookup(filePath);

      if (mimeType !== false) {
        context.header('Content-Type', mimeType);
      }

      const fullPath: string = path.join(rootPath, filePath);

      const fileStream: fs.ReadStream = fs.createReadStream(fullPath);

      return stream(context, async (stream: StreamingApi): Promise<void> => {
        await stream.pipe(Readable.toWeb(fileStream));
      });
    }
  }

  return SwaggerUiHonoController;
}
