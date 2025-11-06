import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import { Newable } from 'inversify';

import { buildSwaggerUiHonoController } from '../calculations/buildSwaggerUiHonoController';

export class SwaggerUiHonoProvider extends SwaggerUiProvider {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController> {
    return buildSwaggerUiHonoController(options);
  }
}
