import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

import { Container, ServiceIdentifier } from 'inversify';

import { Controller } from '../models/Controller';
import { buildSyncCallRouteHandler } from './buildSyncCallRouteHandler';

describe(buildSyncCallRouteHandler, () => {
  let containerMock: Mocked<Container>;
  let serviceIdentifierFixture: ServiceIdentifier<Controller>;
  let controllerMethodKeyFixture: string | symbol;
  let paramBuilderMock: Mock<
    (request: unknown, response: unknown, next: unknown) => unknown
  >;

  let requestFixture: unknown;
  let responseFixture: unknown;
  let nextFunctionFixture: unknown;

  beforeAll(() => {
    containerMock = {
      getAsync: vitest.fn(),
    } as unknown as Mocked<Container>;
    serviceIdentifierFixture = Symbol();
    controllerMethodKeyFixture = Symbol();
    paramBuilderMock = vitest.fn();

    requestFixture = Symbol();
    responseFixture = Symbol();
    nextFunctionFixture = Symbol();
  });

  describe('when called', () => {
    let controllerMock: Mocked<Controller>;
    let paramFixture: unknown;
    let routeResultFixture: unknown;

    let result: unknown;

    beforeAll(async () => {
      paramFixture = Symbol();
      routeResultFixture = Symbol();

      paramBuilderMock.mockReturnValueOnce(paramFixture);

      controllerMock = {
        [controllerMethodKeyFixture]: vitest
          .fn()
          .mockReturnValueOnce(routeResultFixture),
      };

      containerMock.getAsync.mockResolvedValueOnce(controllerMock);

      result = await buildSyncCallRouteHandler(
        containerMock,
        serviceIdentifierFixture,
        controllerMethodKeyFixture,
        [paramBuilderMock, undefined],
      )(requestFixture, responseFixture, nextFunctionFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call container.getAsync()', () => {
      expect(containerMock.getAsync).toHaveBeenCalledExactlyOnceWith(
        serviceIdentifierFixture,
      );
    });

    it('should call paramBuilder()', () => {
      expect(paramBuilderMock).toHaveBeenCalledExactlyOnceWith(
        requestFixture,
        responseFixture,
        nextFunctionFixture,
      );
    });

    it('should call controller method', () => {
      expect(
        controllerMock[controllerMethodKeyFixture],
      ).toHaveBeenCalledExactlyOnceWith(paramFixture, undefined);
    });

    it('should return expected result', () => {
      expect(result).toBe(routeResultFixture);
    });
  });
});
