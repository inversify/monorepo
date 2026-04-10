import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import type Ajv from 'ajv';

import { type DiscriminatorValidationHandlerPair } from '../models/DiscriminatorValidationHandlerPair.js';
import { type ValidationInputParam } from '../models/ValidatedDecoratorResult.js';
import { type ValidationHandler } from '../models/ValidationHandler.js';
import { buildCompositeValidationHandler } from './buildCompositeValidationHandler.js';

describe(buildCompositeValidationHandler, () => {
  describe('having non object input params', () => {
    let inputParam: unknown;

    beforeAll(() => {
      inputParam = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildCompositeValidationHandler([])(
          Symbol() as unknown as Ajv,
          Symbol(),
          inputParam,
          vitest.fn(),
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(inputParam);
      });
    });
  });

  describe('having null input params', () => {
    let inputParam: unknown;

    beforeAll(() => {
      inputParam = null;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildCompositeValidationHandler([])(
          Symbol() as unknown as Ajv,
          Symbol(),
          inputParam,
          vitest.fn(),
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(inputParam);
      });
    });
  });

  describe('having empty handler map and object input params', () => {
    let inputParam: unknown;

    beforeAll(() => {
      inputParam = {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildCompositeValidationHandler([])(
          Symbol() as unknown as Ajv,
          Symbol(),
          inputParam,
          vitest.fn(),
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(inputParam);
      });
    });
  });

  describe('having non handler map and object input params with right discriminator', () => {
    let ajvFixture: Ajv;
    let discriminatorHandlerPair: DiscriminatorValidationHandlerPair<
      symbol,
      unknown,
      ValidationInputParam
    >;
    let handlerMock: Mock<
      ValidationHandler<
        unknown,
        ValidationInputParam & {
          type: symbol;
        },
        unknown
      >
    >;
    let getEntryMock: Mock;
    let inputParam: unknown;
    let openApiObjectFixture: unknown;

    beforeAll(() => {
      const discriminatorValue: symbol = Symbol();

      handlerMock = vitest.fn();
      discriminatorHandlerPair = [discriminatorValue, handlerMock];
      ajvFixture = Symbol() as unknown as Ajv;
      getEntryMock = vitest.fn();
      inputParam = {
        type: discriminatorValue,
      };
      openApiObjectFixture = Symbol();
    });

    describe('when called', () => {
      let resultFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        resultFixture = Symbol();

        handlerMock.mockReturnValueOnce(resultFixture);

        result = buildCompositeValidationHandler([discriminatorHandlerPair])(
          ajvFixture,
          openApiObjectFixture,
          inputParam,
          getEntryMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call handler()', () => {
        expect(handlerMock).toHaveBeenCalledExactlyOnceWith(
          ajvFixture,
          openApiObjectFixture,
          inputParam,
          getEntryMock,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
