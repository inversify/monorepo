import { beforeAll, describe, expect, it } from 'vitest';

import { type HttpInsightsProviderOptions } from '../../../../insights/adapter/inversify/models/HttpInsightsProviderOptions.js';
import {
  buildHttpInsightsUrlPattern,
  DEFAULT_HTTP_INSIGHTS_URL_PATTERN,
} from './buildHttpInsightsUrlPattern.js';

describe(buildHttpInsightsUrlPattern, () => {
  describe('having no options', () => {
    describe('when called', () => {
      let pattern: RegExp;

      beforeAll(() => {
        pattern = buildHttpInsightsUrlPattern(undefined);
      });

      it('should use the default pattern', () => {
        expect(pattern).toBe(DEFAULT_HTTP_INSIGHTS_URL_PATTERN);
      });

      it('should allow an endpoint outside .inversify', () => {
        expect(pattern.test('/orders')).toBe(true);
        expect(pattern.test('/orders?id=1')).toBe(true);
        expect(pattern.test('/')).toBe(true);
        expect(pattern.test('/.inversifyfoo')).toBe(true);
        expect(pattern.test('/api/.inversify')).toBe(true);
      });

      it('should reject a .inversify endpoint', () => {
        expect(pattern.test('/.inversify')).toBe(false);
        expect(pattern.test('/.inversify/')).toBe(false);
        expect(pattern.test('/.inversify/v1/calls')).toBe(false);
        expect(pattern.test('/.inversify/v1/calls?limit=1')).toBe(false);
        expect(pattern.test('/.inversify/http-insights-ui')).toBe(false);
        expect(
          pattern.test('/.inversify/http-insights-ui/assets/index.js'),
        ).toBe(false);
        expect(pattern.test('.inversify/v1/calls')).toBe(false);
      });
    });
  });

  describe('having url options without a pattern', () => {
    describe('when called', () => {
      let pattern: RegExp;

      beforeAll(() => {
        pattern = buildHttpInsightsUrlPattern({
          url: {},
        });
      });

      it('should use the default pattern', () => {
        expect(pattern).toBe(DEFAULT_HTTP_INSIGHTS_URL_PATTERN);
      });
    });
  });

  describe('having a url pattern', () => {
    let optionsFixture: HttpInsightsProviderOptions;

    beforeAll(() => {
      optionsFixture = {
        url: {
          pattern: /^\/api(?:\/|$|\?)/u,
        },
      };
    });

    describe('when called', () => {
      let pattern: RegExp;

      beforeAll(() => {
        pattern = buildHttpInsightsUrlPattern(optionsFixture);
      });

      it('should return the provided pattern', () => {
        expect(pattern).toBe(optionsFixture.url?.pattern);
      });
    });
  });

  describe('having a global url pattern', () => {
    let providedPattern: RegExp;

    beforeAll(() => {
      providedPattern = /^\/orders/gu;
      providedPattern.lastIndex = 4;
    });

    describe('when called', () => {
      let pattern: RegExp;

      beforeAll(() => {
        pattern = buildHttpInsightsUrlPattern({
          url: {
            pattern: providedPattern,
          },
        });
      });

      it('should match the url on every call', () => {
        expect(pattern.global).toBe(false);
        expect(pattern.test('/orders')).toBe(true);
        expect(pattern.test('/orders')).toBe(true);
      });

      it('should leave the provided pattern lastIndex unchanged', () => {
        expect(providedPattern.lastIndex).toBe(4);
      });
    });
  });

  describe('having a sticky url pattern', () => {
    let providedPattern: RegExp;

    beforeAll(() => {
      providedPattern = /^\/orders/y;
      providedPattern.lastIndex = 3;
    });

    describe('when called', () => {
      let pattern: RegExp;

      beforeAll(() => {
        pattern = buildHttpInsightsUrlPattern({
          url: {
            pattern: providedPattern,
          },
        });
      });

      it('should match the url on every call', () => {
        expect(pattern.sticky).toBe(false);
        expect(pattern.test('/orders')).toBe(true);
        expect(pattern.test('/orders')).toBe(true);
      });

      it('should leave the provided pattern lastIndex unchanged', () => {
        expect(providedPattern.lastIndex).toBe(3);
      });
    });
  });
});
