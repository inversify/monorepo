import { describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import {
  injectable,
  postConstruct,
  preDestroy,
  type ResolutionContext,
} from '@inversifyjs/core';

import { Container } from '../container/services/Container.js';

describe('inversify/monorepo#2229', () => {
  it('should activate from parent containers to child containers and deactivate from child containers to parent containers', () => {
    const log: string[] = [];

    @injectable()
    class Service {
      @postConstruct()
      public init(): void {
        log.push('postConstruct');
      }

      @preDestroy()
      public destroy(): void {
        log.push('preDestroy');
      }
    }

    const parent: Container = new Container();
    const child: Container = new Container({ parent });
    const binding = child.bind(Service).toSelf().inSingletonScope();

    binding.onActivation(
      (_context: ResolutionContext, service: Service): Service => {
        log.push('binding');

        return service;
      },
    );
    binding.onDeactivation((): void => {
      log.push('binding');
    });
    parent.onActivation(
      Service,
      (_context: ResolutionContext, service: Service): Service => {
        log.push('parent container');

        return service;
      },
    );
    child.onActivation(
      Service,
      (_context: ResolutionContext, service: Service): Service => {
        log.push('child container');

        return service;
      },
    );
    parent.onDeactivation(Service, (): void => {
      log.push('parent container');
    });
    child.onDeactivation(Service, (): void => {
      log.push('child container');
    });

    child.get(Service);

    expect(log).toStrictEqual([
      'postConstruct',
      'binding',
      'parent container',
      'child container',
    ]);

    log.length = 0;

    child.unbind(Service);

    expect(log).toStrictEqual([
      'child container',
      'parent container',
      'binding',
      'preDestroy',
    ]);
  });
});
