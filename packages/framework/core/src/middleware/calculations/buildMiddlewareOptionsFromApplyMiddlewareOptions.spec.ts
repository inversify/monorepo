import { beforeAll, describe, expect, it } from 'vitest';

import { Newable, ServiceIdentifier } from 'inversify';

import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';
import { Middleware } from '../models/Middleware';
import { MiddlewareOptions } from '../models/MiddlewareOptions';
import { MiddlewarePhase } from '../models/MiddlewarePhase';
import { buildMiddlewareOptionsFromApplyMiddlewareOptions } from './buildMiddlewareOptionsFromApplyMiddlewareOptions';

describe(buildMiddlewareOptionsFromApplyMiddlewareOptions, () => {
  describe('having applyMiddlewareOptionsList with ServiceIdentifier<Middleware>', () => {
    let firstApplyMiddlewareOptionsFixture: ServiceIdentifier<Middleware>;
    let secondApplyMiddlewareOptionsFixture: ServiceIdentifier<Middleware>;

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
