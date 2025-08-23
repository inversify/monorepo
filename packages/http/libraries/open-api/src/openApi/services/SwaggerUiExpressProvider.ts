import express from 'express';
import { Newable } from 'inversify';

import { buildSwaggerUiExpressController } from '../calculations/buildSwaggerUiExpressController';
import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';
import { SwaggerUiProvider } from './SwaggerUiProvider';

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
