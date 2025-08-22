import { beforeAll, describe, expect, it, Mock, Mocked, vitest } from 'vitest';

import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { BindToFluentSyntax, Container, Newable } from 'inversify';

import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';
import { SwaggerUiProviderUiOptions } from '../models/SwaggerUiProviderUiOptions';
import { SwaggerUiProvider } from './SwaggerUiProvider';

const buildControllerTypeMock: Mock<
  (
    options: SwaggerUiProviderOptions,
  ) => Newable<BaseSwaggerUiController<unknown, unknown>>
> = vitest.fn();

class SwaggerUiProviderMock extends SwaggerUiProvider<unknown, unknown> {
  protected override _buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController<unknown, unknown>> {
    return buildControllerTypeMock(options);
  }
}

describe(SwaggerUiProvider, () => {
  let optionsFixture: SwaggerUiProviderOptions;

  let controllerTypeFixture: Newable<BaseSwaggerUiController<unknown, unknown>>;

  beforeAll(() => {
    optionsFixture = {
      api: {
        openApiObject: Symbol() as unknown as OpenApi3Dot1Object,
        path: '/path/fixture',
      },
      ui: Symbol() as unknown as SwaggerUiProviderUiOptions,
    };
    controllerTypeFixture = Symbol() as unknown as Newable<
      BaseSwaggerUiController<unknown, unknown>
    >;

    buildControllerTypeMock.mockReturnValueOnce(controllerTypeFixture);
  });

  describe('.provide', () => {
    let bindToFluentSyntaxMock: Mocked<BindToFluentSyntax<unknown>>;
    let containerMock: Mocked<Container>;

    beforeAll(() => {
      bindToFluentSyntaxMock = {
        toSelf: vitest.fn(),
      } as Partial<Mocked<BindToFluentSyntax<unknown>>> as Mocked<
        BindToFluentSyntax<unknown>
      >;
      containerMock = {
        bind: vitest.fn(),
      } as Partial<Mocked<Container>> as Mocked<Container>;
    });

    describe('when called', () => {
      let swaggerUiProvider: SwaggerUiProviderMock;

      let result: unknown;

      beforeAll(() => {
        swaggerUiProvider = new SwaggerUiProviderMock(optionsFixture);

        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        result = swaggerUiProvider.provide(containerMock);
      });

      it('should call bindToFluentSyntax.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledTimes(1);
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledWith();
      });

      it('should call container.bind()', () => {
        expect(containerMock.bind).toHaveBeenCalledTimes(1);
        expect(containerMock.bind).toHaveBeenCalledWith(controllerTypeFixture);
      });

      it('should return the expected result', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called twice', () => {
      let swaggerUiProvider: SwaggerUiProviderMock;

      let result: unknown;

      beforeAll(() => {
        swaggerUiProvider = new SwaggerUiProviderMock(optionsFixture);

        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        swaggerUiProvider.provide(containerMock);

        try {
          swaggerUiProvider.provide(containerMock);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        const expectedErrorProperties: Partial<Error> = {
          message: 'Cannot provide docs more than once',
        };

        expect(result).toBeInstanceOf(Error);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });
});
