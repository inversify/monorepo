/* eslint-disable @typescript-eslint/no-unused-vars */
// Shift-line-spaces-2
// Is-inversify-import-example
import {
  Container,
  ContainerModule,
  ContainerModuleLoadOptions,
  inject,
  injectable,
  named,
} from 'inversify7';

interface Weapon {
  damage: number;
}

@injectable()
export class Katana implements Weapon {
  public readonly damage: number = 10;
}

@injectable()
export class Ninja {
  @inject('Weapon')
  @named('Melee')
  public readonly weapon!: Weapon;
}

export const container: Container = new Container();

const scriptExecution: Promise<void> = (async () => {
  // Begin-example
  const weaponsModule: ContainerModule = new ContainerModule(
    (options: ContainerModuleLoadOptions) => {
      options.bind<Katana>('Weapon').to(Katana).whenNamed('Melee');
    },
  );

  // v7: async load (default)
  await container.load(weaponsModule);

  container.bind(Ninja).toSelf();

  const ninja: Ninja = container.get(Ninja);
  // End-example
})();

export const ninjaPromise: Promise<Ninja> = scriptExecution.then(() =>
  container.get(Ninja),
);
