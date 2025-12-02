import { describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container } from '../container/services/Container';

describe('inversify/InversifyJS#1744', () => {
  it('container.get() should not complain about false circular dependencies', () => {
    const serviceIdentifier: symbol = Symbol.for('serviceIdentifier');

    const serviceIdentifierService: symbol = Symbol();

    const container: Container = new Container();

    container
      .bind(serviceIdentifier)
      .toConstantValue(serviceIdentifierService)
      .whenDefault();
    container
      .bind(serviceIdentifier)
      .toResolvedValue(
        (service: unknown): unknown => service,
        [serviceIdentifier],
      )
      .whenNamed('name');

    const resolvedNameService: unknown = container.get(serviceIdentifier, {
      name: 'name',
    });

    expect(resolvedNameService).toBe(serviceIdentifierService);
  });

  it('container.get() should complain about circular dependencies', () => {
    const serviceIdentifier: symbol = Symbol.for('serviceIdentifier');

    const container: Container = new Container();

    container
      .bind(serviceIdentifier)
      .toResolvedValue(
        (service: unknown): unknown => service,
        [serviceIdentifier],
      );

    expect(() => {
      container.get(serviceIdentifier);
    }).toThrow(
      'Circular dependency found: Symbol(serviceIdentifier) -> Symbol(serviceIdentifier)',
    );
  });
});
