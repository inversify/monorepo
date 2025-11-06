import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import { Newable } from 'inversify';

import { buildSwaggerUiExpress4Controller } from '../calculations/buildSwaggerUiExpress4Controller';

export class SwaggerUiExpress4Provider extends SwaggerUiProvider {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController> {
    return buildSwaggerUiExpress4Controller(options);
  }
}
