import {
  buildNormalizedPath,
  Controller,
  Get,
  type HttpResponse,
  Params,
  SetHeader,
} from '@inversifyjs/http-core';
import { type Newable } from 'inversify';

import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController.js';
import { type BaseSwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions.js';

export function buildSwaggerUiController<TOpenApiObject>(
  options: BaseSwaggerUiProviderOptions<TOpenApiObject>,
): Newable<BaseSwaggerUiController<TOpenApiObject>> {
  @Controller(buildNormalizedPath(options.api.path))
  class SwaggerUiController extends BaseSwaggerUiController<TOpenApiObject> {
    constructor() {
      super(options);
    }

    @Get()
    @SetHeader('Content-Type', 'text/html')
    public override getSwaggerUi(): string {
      return super.getSwaggerUi();
    }

    @Get('/spec')
    public override getOpenApiObject(): TOpenApiObject {
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
