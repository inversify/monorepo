import { describe, expect, it } from 'vitest';

import { Container, type Inject, type Injectable } from '../../index.js';

describe('Issue 1564', () => {
  it('should not throw on getting async services bound using "toService"', async () => {
    class Database implements Injectable {
      constructor() {
        console.log('new Database');
      }
    }

    class Service1 implements Injectable {
      constructor(public database: Inject<Database>) {
        console.log('new Service1');
      }
    }

    class Service2 implements Injectable {
      constructor(public service1: Inject<Service1>) {
        console.log('new Service2');
      }
    }

    const container: Container = new Container({ defaultScope: 'Request' });

    container.bind(Database).toDynamicValue(async () => {
      console.log('connecting to db...');
      return new Database();
    });

    container.bind(Service1).toSelf();
    container.bind(Service2).toSelf();

    container.bind('services').toService(Service1);
    container.bind('services').toService(Service2);

    const result: unknown[] = await container.getAllAsync('services');

    expect(result).toHaveLength(2);
  });
});
