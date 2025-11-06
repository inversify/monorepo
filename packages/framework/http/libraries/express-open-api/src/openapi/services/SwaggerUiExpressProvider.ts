import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import { Newable } from 'inversify';

import { buildSwaggerUiExpressController } from '../calculations/buildSwaggerUiExpressController';

export class SwaggerUiExpressProvider extends SwaggerUiProvider {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController> {
    return buildSwaggerUiExpressController(options);
  }
}
