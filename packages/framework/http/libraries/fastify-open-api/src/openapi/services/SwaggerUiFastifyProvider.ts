import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import { Newable } from 'inversify';

import { buildSwaggerUiFastifyController } from '../calculations/buildSwaggerUiFastifyController';

export class SwaggerUiFastifyProvider extends SwaggerUiProvider {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController> {
    return buildSwaggerUiFastifyController(options);
  }
}
