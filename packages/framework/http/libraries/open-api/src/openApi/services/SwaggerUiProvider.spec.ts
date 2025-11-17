import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/http-core');
vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock(
  '../../metadata/actions/mergeOpenApiPathItemObjectIntoOpenApiPaths',
);
vitest.mock('../actions/mergeOpenApiTypeSchema');
vitest.mock('../calculations/buildSwaggerUiController');

import {
  buildNormalizedPath,
  ControllerMetadata,
  ControllerMethodMetadata,
  getControllerMetadataList,
  getControllerMethodMetadataList,
  RequestMethodType,
} from '@inversifyjs/http-core';
import {
  OpenApi3Dot1Object,
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { BindToFluentSyntax, Container, Newable } from 'inversify';

import { mergeOpenApiPathItemObjectIntoOpenApiPaths } from '../../metadata/actions/mergeOpenApiPathItemObjectIntoOpenApiPaths';
import { ControllerOpenApiMetadata } from '../../metadata/models/ControllerOpenApiMetadata';
import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { mergeOpenApiTypeSchema } from '../actions/mergeOpenApiTypeSchema';
import { buildSwaggerUiController } from '../calculations/buildSwaggerUiController';
import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';
import { SwaggerUiProviderUiOptions } from '../models/SwaggerUiProviderUiOptions';
import { SwaggerUiProvider } from './SwaggerUiProvider';

describe(SwaggerUiProvider, () => {
  let optionsFixture: SwaggerUiProviderOptions;

  let controllerTypeFixture: Newable<BaseSwaggerUiController>;

  beforeAll(() => {
    optionsFixture = {
      api: {
        openApiObject: {} as OpenApi3Dot1Object,
        path: '/path/fixture',
      },
      ui: Symbol() as unknown as SwaggerUiProviderUiOptions,
    };
    controllerTypeFixture =
      Symbol() as unknown as Newable<BaseSwaggerUiController>;
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
        isBound: vitest.fn(),
      } as Partial<Mocked<Container>> as Mocked<Container>;
    });

    describe('when called, and getControllerMetadataList() returns undefined', () => {
      let swaggerUiProvider: SwaggerUiProvider;

      let result: unknown;

      beforeAll(() => {
        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(buildSwaggerUiController)
          .mockReturnValueOnce(controllerTypeFixture);

        vitest.mocked(getControllerMetadataList).mockReturnValueOnce(undefined);

        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        result = swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildSwaggerUiController()', () => {
        expect(buildSwaggerUiController).toHaveBeenCalledExactlyOnceWith(
          optionsFixture,
        );
      });

      it('should call bindToFluentSyntax.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call container.bind()', () => {
        expect(containerMock.bind).toHaveBeenCalledExactlyOnceWith(
          controllerTypeFixture,
        );
      });

      it('should return the expected result', () => {
        expect(result).toBeUndefined();
      });

      it('should not call mergeOpenApiTypeSchema()', () => {
        expect(mergeOpenApiTypeSchema).not.toHaveBeenCalled();
      });
    });

    describe('when called twice, and getControllerMetadataList() returns undefined', () => {
      let swaggerUiProvider: SwaggerUiProvider;

      let result: unknown;

      beforeAll(() => {
        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(buildSwaggerUiController)
          .mockReturnValueOnce(controllerTypeFixture);

        vitest.mocked(getControllerMetadataList).mockReturnValueOnce(undefined);

        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        swaggerUiProvider.provide(containerMock);

        try {
          swaggerUiProvider.provide(containerMock);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildSwaggerUiController()', () => {
        expect(buildSwaggerUiController).toHaveBeenCalledExactlyOnceWith(
          optionsFixture,
        );
      });

      it('should call bindToFluentSyntax.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call container.bind()', () => {
        expect(containerMock.bind).toHaveBeenCalledExactlyOnceWith(
          controllerTypeFixture,
        );
      });

      it('should throw an Error', () => {
        const expectedErrorProperties: Partial<Error> = {
          message: 'Cannot provide docs more than once',
        };

        expect(result).toBeInstanceOf(Error);
        expect(result).toMatchObject(expectedErrorProperties);
      });

      it('should not call mergeOpenApiTypeSchema()', () => {
        expect(mergeOpenApiTypeSchema).not.toHaveBeenCalled();
      });
    });

    describe('when called, and getControllerMetadataList() returns controller metadata list with no controller openapi metadata', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let swaggerUiProvider: SwaggerUiProvider;

      let result: unknown;

      beforeAll(() => {
        controllerMetadataListFixture = [
          {
            path: '/test',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(buildSwaggerUiController)
          .mockReturnValueOnce(controllerTypeFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest.mocked(getControllerMethodMetadataList).mockReturnValueOnce([]);
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);
        containerMock.isBound.mockReturnValueOnce(true);

        result = swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getControllerMetadataList()', () => {
        expect(getControllerMetadataList).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call container.isBound()', () => {
        expect(containerMock.isBound).toHaveBeenCalledExactlyOnceWith(
          (controllerMetadataListFixture[0] as ControllerMetadata)
            .serviceIdentifier,
        );
      });

      it('should call getControllerMethodMetadataList()', () => {
        expect(getControllerMethodMetadataList).toHaveBeenCalledExactlyOnceWith(
          (controllerMetadataListFixture[0] as ControllerMetadata).target,
        );
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          (controllerMetadataListFixture[0] as ControllerMetadata).target,
          controllerOpenApiMetadataReflectKey,
        );
      });

      it('should call container.bind()', () => {
        expect(containerMock.bind).toHaveBeenCalledExactlyOnceWith(
          controllerTypeFixture,
        );
      });

      it('should call bindToFluentSyntax.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return the expected result', () => {
        expect(result).toBeUndefined();
      });

      it('should not call mergeOpenApiTypeSchema()', () => {
        expect(mergeOpenApiTypeSchema).not.toHaveBeenCalled();
      });
    });

    describe('when called, and getControllerMetadataList() returns filtered controller metadata (unbound controller)', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let swaggerUiProvider: SwaggerUiProvider;

      let result: unknown;

      beforeAll(() => {
        controllerMetadataListFixture = [
          {
            path: '/test',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(buildSwaggerUiController)
          .mockReturnValueOnce(controllerTypeFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);

        containerMock.isBound.mockReturnValueOnce(false);
        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        result = swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getControllerMetadataList()', () => {
        expect(getControllerMetadataList).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call container.isBound()', () => {
        expect(containerMock.isBound).toHaveBeenCalledExactlyOnceWith(
          (controllerMetadataListFixture[0] as ControllerMetadata)
            .serviceIdentifier,
        );
      });

      it('should not call getControllerMethodMetadataList()', () => {
        expect(getControllerMethodMetadataList).not.toHaveBeenCalled();
      });

      it('should not call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).not.toHaveBeenCalled();
      });

      it('should call container.bind()', () => {
        expect(containerMock.bind).toHaveBeenCalledExactlyOnceWith(
          controllerTypeFixture,
        );
      });

      it('should call bindToFluentSyntax.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return the expected result', () => {
        expect(result).toBeUndefined();
      });

      it('should not call mergeOpenApiTypeSchema()', () => {
        expect(mergeOpenApiTypeSchema).not.toHaveBeenCalled();
      });
    });

    describe('when called, and getOwnReflectMetadata() returns openapi metadata and getControllerMethodMetadataList() returns method metadata with operations', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;
      let operationObjectFixture: OpenApi3Dot1OperationObject;

      let swaggerUiProvider: SwaggerUiProvider;

      let result: unknown;

      beforeAll(() => {
        operationObjectFixture = {
          summary: 'Test operation',
        } as OpenApi3Dot1OperationObject;

        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map([
            ['testMethod', operationObjectFixture],
          ]),
          references: new Set(),
          servers: undefined,
          summary: 'Test controller summary',
        };

        controllerMethodMetadataListFixture = [
          {
            methodKey: 'testMethod',
            path: '/test-method',
            requestMethodType: RequestMethodType.Get,
          } as ControllerMethodMetadata,
        ];

        controllerMetadataListFixture = [
          {
            path: '/api',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(buildSwaggerUiController)
          .mockReturnValueOnce(controllerTypeFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce(controllerMethodMetadataListFixture);
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(controllerOpenApiMetadataFixture);
        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce('/api/test-method');
        vitest
          .mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths)
          .mockImplementation(
            (openApiObject: OpenApi3Dot1Object) => openApiObject,
          );

        containerMock.isBound.mockReturnValueOnce(true);
        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        result = swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();

        vitest.mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths).mockReset();
      });

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          '/api//test-method',
        );
      });

      it('should call mergeOpenApiPathItemObjectIntoOpenApiPaths()', () => {
        expect(
          mergeOpenApiPathItemObjectIntoOpenApiPaths,
        ).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.api.openApiObject,
          '/api/test-method',
          expect.objectContaining({
            get: operationObjectFixture,
            summary: 'Test controller summary',
          }),
        );
      });

      it('should call container.bind()', () => {
        expect(containerMock.bind).toHaveBeenCalledExactlyOnceWith(
          controllerTypeFixture,
        );
      });

      it('should call bindToFluentSyntax.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return the expected result', () => {
        expect(result).toBeUndefined();
      });

      it('should call mergeOpenApiTypeSchema() for each reference', () => {
        expect(mergeOpenApiTypeSchema).toHaveBeenCalledTimes(0);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns openapi metadata without summary', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;
      let operationObjectFixture: OpenApi3Dot1OperationObject;

      let swaggerUiProvider: SwaggerUiProvider;

      beforeAll(() => {
        operationObjectFixture = {
          summary: 'Test operation',
        } as OpenApi3Dot1OperationObject;

        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map([
            ['testMethod', operationObjectFixture],
          ]),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        controllerMethodMetadataListFixture = [
          {
            methodKey: 'testMethod',
            path: '/test-method',
            requestMethodType: RequestMethodType.Post,
          } as ControllerMethodMetadata,
        ];

        controllerMetadataListFixture = [
          {
            path: '/api',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce(controllerMethodMetadataListFixture);
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(controllerOpenApiMetadataFixture);
        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce('/api/test-method');
        vitest
          .mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths)
          .mockImplementation(
            (openApiObject: OpenApi3Dot1Object) => openApiObject,
          );

        containerMock.isBound.mockReturnValueOnce(true);
        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();

        vitest.mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths).mockReset();
      });

      it('should call mergeOpenApiPathItemObjectIntoOpenApiPaths() with pathItemObject without summary', () => {
        expect(
          mergeOpenApiPathItemObjectIntoOpenApiPaths,
        ).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.api.openApiObject,
          '/api/test-method',
          expect.objectContaining({
            post: operationObjectFixture,
          }),
        );

        const pathItemObject: OpenApi3Dot1PathItemObject | undefined =
          vitest.mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths).mock
            .calls[0]?.[2];

        expect(pathItemObject).not.toHaveProperty('summary');
      });

      it('should call mergeOpenApiTypeSchema() for each reference', () => {
        expect(mergeOpenApiTypeSchema).toHaveBeenCalledTimes(0);
      });
    });

    describe('when called, and getControllerMethodMetadataList() returns metadata with no operations', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;

      let swaggerUiProvider: SwaggerUiProvider;

      beforeAll(() => {
        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        controllerMethodMetadataListFixture = [
          {
            methodKey: 'testMethod',
            path: '/test-method',
            requestMethodType: RequestMethodType.Get,
          } as ControllerMethodMetadata,
        ];

        controllerMetadataListFixture = [
          {
            path: '/api',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce(controllerMethodMetadataListFixture);
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(controllerOpenApiMetadataFixture);
        vitest
          .mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths)
          .mockImplementation(
            (openApiObject: OpenApi3Dot1Object) => openApiObject,
          );

        containerMock.isBound.mockReturnValueOnce(true);
        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();

        vitest.mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths).mockReset();
      });

      it('should not call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).not.toHaveBeenCalled();
      });

      it('should not call mergeOpenApiPathItemObjectIntoOpenApiPaths()', () => {
        expect(
          mergeOpenApiPathItemObjectIntoOpenApiPaths,
        ).not.toHaveBeenCalled();
      });

      it('should call mergeOpenApiTypeSchema() for each reference', () => {
        expect(mergeOpenApiTypeSchema).toHaveBeenCalledTimes(0);
      });
    });

    describe('when called, and getControllerMethodMetadataList() returns multiple metadata with HTTP verbs', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;
      let operationObjectFixture1: OpenApi3Dot1OperationObject;
      let operationObjectFixture2: OpenApi3Dot1OperationObject;
      let operationObjectFixture3: OpenApi3Dot1OperationObject;
      let swaggerUiProvider: SwaggerUiProvider;

      beforeAll(() => {
        operationObjectFixture1 = {
          summary: 'Delete operation',
        } as OpenApi3Dot1OperationObject;

        operationObjectFixture2 = {
          summary: 'Put operation',
        } as OpenApi3Dot1OperationObject;

        operationObjectFixture3 = {
          summary: 'All operations',
        } as OpenApi3Dot1OperationObject;

        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map([
            ['deleteMethod', operationObjectFixture1],
            ['putMethod', operationObjectFixture2],
            ['allMethod', operationObjectFixture3],
          ]),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        controllerMethodMetadataListFixture = [
          {
            methodKey: 'deleteMethod',
            path: '/delete',
            requestMethodType: RequestMethodType.Delete,
          } as ControllerMethodMetadata,
          {
            methodKey: 'putMethod',
            path: '/put',
            requestMethodType: RequestMethodType.Put,
          } as ControllerMethodMetadata,
          {
            methodKey: 'allMethod',
            path: '/all',
            requestMethodType: RequestMethodType.All,
          } as ControllerMethodMetadata,
        ];

        controllerMetadataListFixture = [
          {
            path: '/api',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce(controllerMethodMetadataListFixture);
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(controllerOpenApiMetadataFixture);
        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce('/api/delete')
          .mockReturnValueOnce('/api/put')
          .mockReturnValueOnce('/api/all');
        vitest
          .mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths)
          .mockImplementation(
            (openApiObject: OpenApi3Dot1Object) => openApiObject,
          );

        containerMock.isBound.mockReturnValueOnce(true);
        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();

        vitest.mocked(mergeOpenApiPathItemObjectIntoOpenApiPaths).mockReset();
      });

      it('should call buildNormalizedPath() for each method', () => {
        expect(buildNormalizedPath).toHaveBeenCalledTimes(3);
        expect(buildNormalizedPath).toHaveBeenNthCalledWith(1, '/api//delete');
        expect(buildNormalizedPath).toHaveBeenNthCalledWith(2, '/api//put');
        expect(buildNormalizedPath).toHaveBeenNthCalledWith(3, '/api//all');
      });

      it('should call mergeOpenApiPathItemObjectIntoOpenApiPaths() for each method', () => {
        expect(
          mergeOpenApiPathItemObjectIntoOpenApiPaths,
        ).toHaveBeenCalledTimes(3);

        // Delete method
        expect(
          mergeOpenApiPathItemObjectIntoOpenApiPaths,
        ).toHaveBeenNthCalledWith(
          1,
          optionsFixture.api.openApiObject,
          '/api/delete',
          expect.objectContaining({
            delete: operationObjectFixture1,
          }),
        );

        // Put method
        expect(
          mergeOpenApiPathItemObjectIntoOpenApiPaths,
        ).toHaveBeenNthCalledWith(
          2,
          optionsFixture.api.openApiObject,
          '/api/put',
          expect.objectContaining({
            put: operationObjectFixture2,
          }),
        );

        // All method (should set all HTTP verbs)
        expect(
          mergeOpenApiPathItemObjectIntoOpenApiPaths,
        ).toHaveBeenNthCalledWith(
          3,
          optionsFixture.api.openApiObject,
          '/api/all',
          expect.objectContaining({
            delete: operationObjectFixture3,
            get: operationObjectFixture3,
            head: operationObjectFixture3,
            options: operationObjectFixture3,
            patch: operationObjectFixture3,
            post: operationObjectFixture3,
            put: operationObjectFixture3,
          }),
        );
      });

      it('should call mergeOpenApiTypeSchema() for each reference', () => {
        expect(mergeOpenApiTypeSchema).toHaveBeenCalledTimes(0);
      });
    });

    describe('when called, and there is a duplicated operation at the same path and method', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;
      let operationObjectFixture: OpenApi3Dot1OperationObject;

      let swaggerUiProvider: SwaggerUiProvider;

      let result: unknown;

      beforeAll(() => {
        operationObjectFixture = {
          summary: 'Test operation',
        } as OpenApi3Dot1OperationObject;

        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map([
            ['method1', operationObjectFixture],
            ['method2', operationObjectFixture],
          ]),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        controllerMethodMetadataListFixture = [
          {
            methodKey: 'method1',
            path: '/duplicate',
            requestMethodType: RequestMethodType.Get,
          } as ControllerMethodMetadata,
          {
            methodKey: 'method2',
            path: '/duplicate',
            requestMethodType: RequestMethodType.Get,
          } as ControllerMethodMetadata,
        ];

        controllerMetadataListFixture = [
          {
            path: '/api',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce(controllerMethodMetadataListFixture);
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(controllerOpenApiMetadataFixture);
        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce('/api/duplicate')
          .mockReturnValueOnce('/api/duplicate');

        containerMock.isBound.mockReturnValueOnce(true);

        try {
          swaggerUiProvider.provide(containerMock);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an Error', () => {
        const expectedErrorProperties: Partial<Error> = {
          message:
            'Duplicated metadata found for operation at #/paths//api/duplicate/get',
        };

        expect(result).toBeInstanceOf(Error);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });

    describe('when called, and controllerOpenApiMetadata has references', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;
      let typeFixture1: NewableFunction;
      let typeFixture2: NewableFunction;

      let swaggerUiProvider: SwaggerUiProvider;

      beforeAll(() => {
        typeFixture1 = Symbol() as unknown as NewableFunction;
        typeFixture2 = Symbol() as unknown as NewableFunction;

        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set([typeFixture1, typeFixture2]),
          servers: undefined,
          summary: undefined,
        };

        controllerMethodMetadataListFixture = [];

        controllerMetadataListFixture = [
          {
            path: '/api',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(buildSwaggerUiController)
          .mockReturnValueOnce(controllerTypeFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce(controllerMethodMetadataListFixture);
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(controllerOpenApiMetadataFixture);

        containerMock.isBound.mockReturnValueOnce(true);
        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call mergeOpenApiTypeSchema()', () => {
        expect(mergeOpenApiTypeSchema).toHaveBeenCalledTimes(2);
        expect(mergeOpenApiTypeSchema).toHaveBeenNthCalledWith(
          1,
          optionsFixture.api.openApiObject.components?.schemas ?? {},
          typeFixture1,
        );
        expect(mergeOpenApiTypeSchema).toHaveBeenNthCalledWith(
          2,
          optionsFixture.api.openApiObject.components?.schemas ?? {},
          typeFixture2,
        );
      });

      it('should call container.bind()', () => {
        expect(containerMock.bind).toHaveBeenCalledExactlyOnceWith(
          controllerTypeFixture,
        );
      });

      it('should call bindToFluentSyntax.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });
    });

    describe('when called, and controllerOpenApiMetadata has no references', () => {
      let controllerMetadataListFixture: ControllerMetadata[];
      let controllerMethodMetadataListFixture: ControllerMethodMetadata[];
      let controllerOpenApiMetadataFixture: ControllerOpenApiMetadata;

      let swaggerUiProvider: SwaggerUiProvider;

      beforeAll(() => {
        controllerOpenApiMetadataFixture = {
          methodToPathItemObjectMap: new Map(),
          references: new Set(),
          servers: undefined,
          summary: undefined,
        };

        controllerMethodMetadataListFixture = [];

        controllerMetadataListFixture = [
          {
            path: '/api',
            priority: 0,
            serviceIdentifier: Symbol(),
            target: Symbol() as unknown as NewableFunction,
          },
        ];

        swaggerUiProvider = new SwaggerUiProvider(optionsFixture);

        vitest
          .mocked(buildSwaggerUiController)
          .mockReturnValueOnce(controllerTypeFixture);

        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce(controllerMetadataListFixture);
        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce(controllerMethodMetadataListFixture);
        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce(controllerOpenApiMetadataFixture);

        containerMock.isBound.mockReturnValueOnce(true);
        containerMock.bind.mockReturnValueOnce(bindToFluentSyntaxMock);

        swaggerUiProvider.provide(containerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call mergeOpenApiTypeSchema()', () => {
        expect(mergeOpenApiTypeSchema).not.toHaveBeenCalled();
      });
    });
  });
});
