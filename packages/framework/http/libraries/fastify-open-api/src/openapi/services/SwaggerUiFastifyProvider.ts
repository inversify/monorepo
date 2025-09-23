import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import { FastifyReply } from 'fastify';
import { Newable } from 'inversify';

import { buildSwaggerUiFastifyController } from '../calculations/buildSwaggerUiFastifyController';

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
