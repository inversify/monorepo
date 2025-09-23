import {
  BaseSwaggerUiController,
  SwaggerUiProvider,
  SwaggerUiProviderOptions,
} from '@inversifyjs/http-open-api';
import express from 'express';
import { Newable } from 'inversify';

import { buildSwaggerUiExpressController } from '../calculations/buildSwaggerUiExpressController';

export class SwaggerUiExpressProvider extends SwaggerUiProvider<
  express.Response,
  void
> {
  protected _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController<express.Response, void>> {
    return buildSwaggerUiExpressController(options);
  }
}
