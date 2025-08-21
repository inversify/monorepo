import {
  Controller,
  Get,
  Params,
  Response,
  SetHeader,
} from '@inversifyjs/http-core';
import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import express from 'express';
import { Newable } from 'inversify';

import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiControllerOptions } from '../models/SwaggerUiControllerOptions';

export function swaggerUiControllerExpressBuilder(
  options: SwaggerUiControllerOptions,
): Newable<BaseSwaggerUiController<express.Response>> {
  @Controller(options.apiPath)
  class SwaggerUiExpressController extends BaseSwaggerUiController<express.Response> {
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
      response: express.Response,
    ): Promise<void> {
      await super.getSwaggerUiResource(resource, response);
    }

    protected _sendFile(
      response: express.Response,
      rootPath: string,
      path: string,
    ): void {
      response.sendFile(path, { root: rootPath });
    }
  }

  return SwaggerUiExpressController;
}
