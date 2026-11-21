import { beforeAll, describe, expect, it } from 'vitest';

import { type Amqp1Dot0ConnectionOptions } from '../models/Amqp1Dot0ConnectionOptions.js';
import { buildRheaConnectionOptions } from './buildRheaConnectionOptions.js';

describe(buildRheaConnectionOptions, () => {
  describe('having a virtual host', () => {
    let optionsFixture: Amqp1Dot0ConnectionOptions;

    beforeAll(() => {
      optionsFixture = {
        host: 'broker.example',
        virtualHost: 'orders',
      };
    });

    describe('when called', () => {
      let result: ReturnType<typeof buildRheaConnectionOptions>;

      beforeAll(() => {
        result = buildRheaConnectionOptions(optionsFixture);
      });

      it('should send the virtual host as the open hostname', () => {
        expect(result.hostname).toBe('orders');
        expect(result.host).toBe('broker.example');
      });
    });
  });

  describe('having no virtual host', () => {
    let optionsFixture: Amqp1Dot0ConnectionOptions;

    beforeAll(() => {
      optionsFixture = {
        host: 'broker.example',
      };
    });

    describe('when called', () => {
      let result: ReturnType<typeof buildRheaConnectionOptions>;

      beforeAll(() => {
        result = buildRheaConnectionOptions(optionsFixture);
      });

      it('should fall back to the host', () => {
        expect(result.hostname).toBe('broker.example');
      });
    });
  });

  describe('having a session buffer size', () => {
    let optionsFixture: Amqp1Dot0ConnectionOptions;

    beforeAll(() => {
      optionsFixture = {
        host: 'broker.example',
        sessionBufferSize: 2,
      };
    });

    describe('when called', () => {
      let result: ReturnType<typeof buildRheaConnectionOptions>;

      beforeAll(() => {
        result = buildRheaConnectionOptions(optionsFixture);
      });

      it('should set the session buffer size', () => {
        expect(result.session_buffer_size).toBe(2);
      });
    });
  });
});
