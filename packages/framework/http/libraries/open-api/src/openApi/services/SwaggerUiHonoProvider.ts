import { Context } from 'hono';
import { Newable } from 'inversify';

import { buildSwaggerUiHonoController } from '../calculations/buildSwaggerUiHonoController';
import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';
import { SwaggerUiProvider } from './SwaggerUiProvider';

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
