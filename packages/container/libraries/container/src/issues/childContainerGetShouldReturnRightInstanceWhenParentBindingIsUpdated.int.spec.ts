import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { ServiceIdentifier } from '@inversifyjs/common';

import { Container } from '../container/services/Container';

describe('Container.get should should return right instance when parent binding is updated', () => {
  let expectedValue: string;

  let result: unknown;

  beforeAll(() => {
    const serviceIdentifier: ServiceIdentifier = Symbol();

    const firstValue: string = 'first';
    expectedValue = 'expected';

    const container: Container = new Container();
    const childContainer: Container = new Container({
      parent: container,
    });

    container.bind(serviceIdentifier).toConstantValue(firstValue);

    childContainer.get(serviceIdentifier);

    container.unbindSync(serviceIdentifier);
    container.bind(serviceIdentifier).toConstantValue(expectedValue);

    result = childContainer.get(serviceIdentifier);
  });

  it('should return expected value', () => {
    expect(result).toBe(expectedValue);
  });
});
