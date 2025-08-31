import { FastifyReply } from 'fastify';
import { Newable } from 'inversify';

import { buildSwaggerUiFastifyController } from '../calculations/buildSwaggerUiFastifyController';
import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';
import { SwaggerUiProvider } from './SwaggerUiProvider';

export class SwaggerUiFastifyProvider extends SwaggerUiProvider<
  FastifyReply,
  void
> {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController<FastifyReply, void>> {
    return buildSwaggerUiFastifyController(options);
  }
}
