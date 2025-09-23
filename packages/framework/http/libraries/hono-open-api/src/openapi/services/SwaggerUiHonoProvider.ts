import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import { Context } from 'hono';
import { Newable } from 'inversify';

import { buildSwaggerUiHonoController } from '../calculations/buildSwaggerUiHonoController';

export class SwaggerUiHonoProvider extends SwaggerUiProvider<
  Context,
  Response | undefined
> {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController<Context, Response | undefined>> {
    return buildSwaggerUiHonoController(options);
  }
}
