import { beforeAll, describe, expect, it } from 'vitest';

import { type Newable, type ServiceIdentifier } from 'inversify';

import { type ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../models/Middleware.js';
import { type MiddlewareOptions } from '../models/MiddlewareOptions.js';
import { MiddlewarePhase } from '../models/MiddlewarePhase.js';
import { buildMiddlewareOptionsFromApplyMiddlewareOptions } from './buildMiddlewareOptionsFromApplyMiddlewareOptions.js';

describe(buildMiddlewareOptionsFromApplyMiddlewareOptions, () => {
  describe('having applyMiddlewareOptionsList with ServiceIdentifier<Middleware>', () => {
    let firstApplyMiddlewareOptionsFixture: ServiceIdentifier<Middleware>;
    let secondApplyMiddlewareOptionsFixture: ServiceIdentifier<Middleware>;

    beforeAll(() => {
      firstApplyMiddlewareOptionsFixture =
        class FirstMiddlewareFixture {} as ServiceIdentifier<Middleware>;
      secondApplyMiddlewareOptionsFixture =
        class SecondMiddlewareFixture {} as ServiceIdentifier<Middleware>;
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
