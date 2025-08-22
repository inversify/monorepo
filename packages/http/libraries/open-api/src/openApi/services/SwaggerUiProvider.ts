import { Container, Newable } from 'inversify';

import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';

export abstract class SwaggerUiProvider<TResponse, TResult> {
  readonly #controllerType: Newable<
    BaseSwaggerUiController<TResponse, TResult>
  >;

  #provided: boolean;

  constructor(options: SwaggerUiProviderOptions) {
    this.#controllerType = this._buildControllerType(options);
    this.#provided = false;
  }

  public provide(container: Container): void {
    if (this.#provided) {
      throw new Error('Cannot provide docs more than once');
    }

    container.bind(this.#controllerType).toSelf();

    this.#provided = true;
  }

  protected abstract _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController<TResponse, TResult>>;
}
