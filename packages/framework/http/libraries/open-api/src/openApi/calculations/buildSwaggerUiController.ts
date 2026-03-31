import {
  buildNormalizedPath,
  Controller,
  Get,
  type HttpResponse,
  Params,
  SetHeader,
} from '@inversifyjs/http-core';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { type Newable } from 'inversify';

import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController.js';
import { type SwaggerUiProviderOptions } from '../models/v3Dot1/SwaggerUiProviderOptions.js';

export function buildSwaggerUiController(
  options: SwaggerUiProviderOptions,
): Newable<BaseSwaggerUiController> {
  @Controller(buildNormalizedPath(options.api.path))
  class SwaggerUiController extends BaseSwaggerUiController {
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
      @Params({
        name: 'resource',
      })
      resource: string,
    ): HttpResponse {
      return super.getSwaggerUiResource(resource);
    }
  }

  return SwaggerUiController;
}
