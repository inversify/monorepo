import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/http-core'));

import {
  buildNormalizedPath,
  type ControllerMetadata,
  type ControllerMethodMetadata,
  getControllerMetadataList,
  getControllerMethodMetadataList,
  RequestMethodType,
} from '@inversifyjs/http-core';

import { resolveControllerMethodParamNameList } from './resolveControllerMethodParamNameList.js';

class TestController {}
class TestDerivedController extends TestController {}
class TestUnrelatedController {}

function buildControllerMetadata(
  target: NewableFunction,
  path: string,
): ControllerMetadata {
  return {
    path,
    priority: 0,
    serviceIdentifier: target as never,
    target,
  };
}

function buildControllerMethodMetadata(
  methodKey: string,
  path: string,
): ControllerMethodMetadata {
  return {
    methodKey,
    path,
    requestMethodType: RequestMethodType.Get,
  };
}

describe(resolveControllerMethodParamNameList, () => {
  beforeAll(() => {
    vitest
      .mocked(buildNormalizedPath)
      .mockImplementation((path: string): string => path);
  });

  describe('having a controller constructor with controller and method path metadata', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce([
            buildControllerMetadata(TestUnrelatedController, '/unrelated'),
            buildControllerMetadata(TestController, '/users/:tenantId'),
          ]);

        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce([
            buildControllerMethodMetadata('otherMethod', '/:otherId'),
            buildControllerMethodMetadata(
              'testMethod',
              '/:userId/items/:itemId',
            ),
          ]);

        result = resolveControllerMethodParamNameList(
          TestController,
          'testMethod',
        );
      });

      afterAll(() => {
        vitest.mocked(getControllerMethodMetadataList).mockReset();
      });

      it('should return the param names of the whole route path', () => {
        expect(result).toStrictEqual(['tenantId', 'userId', 'itemId']);
      });
    });
  });

  describe('having a controller constructor with several method path metadata for the same method', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce([
            buildControllerMetadata(TestController, '/users'),
          ]);

        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce([
            buildControllerMethodMetadata('testMethod', '/:userId'),
            buildControllerMethodMetadata(
              'testMethod',
              '/:userId/items/:itemId',
            ),
          ]);

        try {
          resolveControllerMethodParamNameList(TestController, 'testMethod');
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.mocked(getControllerMethodMetadataList).mockReset();
      });

      it('should throw an error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toContain(
          'The method is mapped to multiple paths with different route parameters',
        );
      });
    });

    describe('when called with a matched route path', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce([
            buildControllerMetadata(TestController, '/users'),
          ]);

        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce([
            buildControllerMethodMetadata('testMethod', '/:userId'),
            buildControllerMethodMetadata(
              'testMethod',
              '/:userId/items/:itemId',
            ),
          ]);

        result = resolveControllerMethodParamNameList(
          TestController,
          'testMethod',
          '/users/:userId',
        );
      });

      afterAll(() => {
        vitest.mocked(getControllerMethodMetadataList).mockReset();
      });

      it('should return the param names of the matched route path', () => {
        expect(result).toStrictEqual(['userId']);
      });
    });
  });

  describe('having a controller constructor extended by a decorated controller', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce([
            buildControllerMetadata(TestDerivedController, '/users'),
          ]);

        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce([
            buildControllerMethodMetadata('testMethod', '/:userId'),
          ]);

        result = resolveControllerMethodParamNameList(
          TestController,
          'testMethod',
        );
      });

      afterAll(() => {
        vitest.mocked(getControllerMethodMetadataList).mockReset();
      });

      it('should return the param names of the derived controller route path', () => {
        expect(result).toStrictEqual(['userId']);
      });
    });
  });

  describe('having a controller constructor without method path metadata', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getControllerMetadataList)
          .mockReturnValueOnce([
            buildControllerMetadata(TestController, '/users'),
          ]);

        vitest
          .mocked(getControllerMethodMetadataList)
          .mockReturnValueOnce([
            buildControllerMethodMetadata('otherMethod', '/:otherId'),
          ]);

        try {
          resolveControllerMethodParamNameList(TestController, 'testMethod');
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.mocked(getControllerMethodMetadataList).mockReset();
      });

      it('should throw an error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toContain(
          'Unable to resolve route parameter names for "TestController.testMethod"',
        );
      });
    });
  });

  describe('having no controller metadata', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getControllerMetadataList).mockReturnValueOnce(undefined);

        try {
          resolveControllerMethodParamNameList(TestController, 'testMethod');
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an error', () => {
        expect(result).toBeInstanceOf(Error);
      });
    });
  });
});
