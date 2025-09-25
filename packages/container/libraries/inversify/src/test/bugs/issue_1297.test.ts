import { describe, expect, it, Mock, vitest } from 'vitest';

import {
  Container,
  Factory,
  injectable,
  Provider,
  ResolutionContext,
} from '../..';

describe('Issue 1297', () => {
  it('should call onActivation once if the service is a constant value binding', () => {
    const container: Container = new Container();

    const onActivationHandlerMock: Mock<
      (_: ResolutionContext, value: string) => string
    > = vitest
      .fn()
      .mockImplementation((_: ResolutionContext, value: string) => value);

    container
      .bind<string>('message')
      .toConstantValue('Hello world')
      .onActivation(onActivationHandlerMock);

    container.get('message');
    container.get('message');

    expect(onActivationHandlerMock).toHaveBeenCalledTimes(1);
  });

  it('should call onActivation once if the service is a factory binding', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    const container: Container = new Container();

    const onActivationHandlerMock: Mock<
      (_: ResolutionContext, instance: Factory<Katana>) => Factory<Katana>
    > = vitest
      .fn()
      .mockImplementation(
        (_: ResolutionContext, instance: Factory<Katana>) => instance,
      );

    container.bind<Katana>('Katana').to(Katana);

    container
      .bind<Factory<Katana>>('Factory<Katana>')
      .toFactory(
        (context: ResolutionContext) => () => context.get<Katana>('Katana'),
      )
      .onActivation(onActivationHandlerMock);

    container.get('Factory<Katana>');
    container.get('Factory<Katana>');

    expect(onActivationHandlerMock).toHaveBeenCalledTimes(1);
  });

  it('should call onActivation once if the service is a provider binding', () => {
    @injectable()
    class Katana {
      public hit() {
        return 'cut!';
      }
    }

    const container: Container = new Container();

    const onActivationHandlerMock: Mock<
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      (_: ResolutionContext, instance: Provider<Katana>) => Provider<Katana>
    > = vitest.fn().mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      (_: ResolutionContext, instance: Provider<Katana>) => instance,
    );

    container
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      .bind<Provider<Katana>>('Provider<Katana>')
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      .toProvider(
        (_context: ResolutionContext) => async () =>
          Promise.resolve(new Katana()),
      )
      .onActivation(onActivationHandlerMock);

    container.get('Provider<Katana>');
    container.get('Provider<Katana>');

    expect(onActivationHandlerMock).toHaveBeenCalledTimes(1);
  });
});
