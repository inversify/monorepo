import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import express from 'express4';
import { Newable } from 'inversify';

import { buildSwaggerUiExpress4Controller } from '../calculations/buildSwaggerUiExpress4Controller';

export class SwaggerUiExpress4Provider extends SwaggerUiProvider<
  express.Response,
  void
> {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController<express.Response, void>> {
    return buildSwaggerUiExpress4Controller(options);
  }
}
