import { beforeAll, describe, expect, it } from 'vitest';

import { Middleware, MiddlewarePhase } from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

import { ApplyMiddlewareOptions } from '../../http/models/ApplyMiddlewareOptions';
import { MiddlewareOptions } from '../model/MiddlewareOptions';
import { buildMiddlewareOptionsFromApplyMiddlewareOptions } from './buildMiddlewareOptionsFromApplyMiddlewareOptions';

describe(buildMiddlewareOptionsFromApplyMiddlewareOptions, () => {
  describe('having applyMiddlewareOptionsList with NewableFunction', () => {
    let firstApplyMiddlewareOptionsFixture: NewableFunction;
    let secondApplyMiddlewareOptionsFixture: NewableFunction;

    beforeAll(() => {
      firstApplyMiddlewareOptionsFixture = class FirstMiddlewareFixture {};
      secondApplyMiddlewareOptionsFixture = class SecondMiddlewareFixture {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildMiddlewareOptionsFromApplyMiddlewareOptions([
          firstApplyMiddlewareOptionsFixture,
          secondApplyMiddlewareOptionsFixture,
        ]);
      });

      it('should return MiddlewareOptions', () => {
        const expectedMiddlewareOptions: MiddlewareOptions = {
          postHandlerMiddlewareList: [],
          preHandlerMiddlewareList: [
            firstApplyMiddlewareOptionsFixture,
            secondApplyMiddlewareOptionsFixture,
          ],
        };

        expect(result).toStrictEqual(expectedMiddlewareOptions);
      });
    });
  });

  describe('having applyMiddlewareOptionsList with ApplyMiddlewareOptions', () => {
    let firstApplyMiddlewareOptionsFixture: ApplyMiddlewareOptions;
    let secondApplyMiddlewareOptionsFixture: ApplyMiddlewareOptions;

    beforeAll(() => {
      firstApplyMiddlewareOptionsFixture = {
        middleware: class FirstMiddlewareFixture {} as Newable<Middleware>,
        phase: MiddlewarePhase.PreHandler,
      };
      secondApplyMiddlewareOptionsFixture = {
        middleware: class SecondMiddlewareFixture {} as Newable<Middleware>,
        phase: MiddlewarePhase.PostHandler,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildMiddlewareOptionsFromApplyMiddlewareOptions([
          firstApplyMiddlewareOptionsFixture,
          secondApplyMiddlewareOptionsFixture,
        ]);
      });

      it('should return MiddlewareOptions', () => {
        const expectedMiddlewareOptions: MiddlewareOptions = {
          postHandlerMiddlewareList: [
            secondApplyMiddlewareOptionsFixture.middleware as Newable<Middleware>,
          ],
          preHandlerMiddlewareList: [
            firstApplyMiddlewareOptionsFixture.middleware as Newable<Middleware>,
          ],
        };

        expect(result).toStrictEqual(expectedMiddlewareOptions);
      });
    });
  });
});
