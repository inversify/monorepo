import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type ConfigObject } from '../models/ConfigObject.js';
import { processEnv } from './processEnv.js';

describe(processEnv, () => {
  describe('having pick options', () => {
    describe('when called', () => {
      const envKeyFixture: string = 'INVERSIFY_CONFIG_PROCESS_ENV_TEST';
      let result: ConfigObject;

      beforeAll(async () => {
        process.env[envKeyFixture] = 'value';

        result = await processEnv({ pick: [envKeyFixture] }).load();
      });

      afterAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete process.env[envKeyFixture];
      });

      it('should return picked environment variables', () => {
        expect(result).toStrictEqual({
          [envKeyFixture]: 'value',
        });
      });
    });
  });

  describe('having pick options with a missing key', () => {
    describe('when called', () => {
      let result: ConfigObject;

      beforeAll(async () => {
        result = await processEnv({
          pick: ['INVERSIFY_CONFIG_MISSING_ENV_KEY'],
        }).load();
      });

      it('should return an empty object', () => {
        expect(result).toStrictEqual({});
      });
    });
  });
});
