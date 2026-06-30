import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container } from '../container/services/Container.js';

describe('inversify/monorepo#1973', () => {
  describe('Service Redirection should be refreshed', () => {
    describe('when service redirection is set on cache', () => {
      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind('service-a').toService('service-b');
        container.bind('service-b').toService('service-c1');
        container.bind('service-c1').toConstantValue('service-c1-value');

        container.get('service-a');
      });

      describe('when redirection changes and service is resolved', () => {
        let result: unknown;

        beforeAll(() => {
          container.rebind('service-b').toService('service-c2');
          container.bind('service-c2').toConstantValue('service-c2-value');

          result = container.get('service-a');
        });

        it('should resolve the service to the expected value', () => {
          expect(result).toBe('service-c2-value');
        });
      });
    });
  });
});
