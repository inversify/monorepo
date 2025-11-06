import {
  buildNormalizedPath,
  Controller,
  Get,
  HttpResponse,
  Params,
  SetHeader,
} from '@inversifyjs/http-core';
import {
  BaseSwaggerUiController,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Newable } from 'inversify';

export function buildSwaggerUiExpressController(
  options: SwaggerUiProviderOptions,
): Newable<BaseSwaggerUiController> {
  @Controller(buildNormalizedPath(options.api.path))
  class SwaggerUiExpressController extends BaseSwaggerUiController {
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

  return SwaggerUiExpressController;
}
