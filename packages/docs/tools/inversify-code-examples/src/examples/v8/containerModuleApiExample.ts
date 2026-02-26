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
} from 'inversify8';

interface Weapon {
  damage: number;
}

@injectable()
export class Katana implements Weapon {
  public readonly damage: number = 10;
}

@injectable()
export class Shuriken implements Weapon {
  public readonly damage: number = 5;
}

@injectable()
export class Ninja {
  @inject('Weapon')
  @named('Ranged')
  public readonly weapon!: Weapon;
}

const container: Container = new Container();

const scriptExecution: Promise<void> = (async () => {
  // Begin-example
  const warriorsModule: ContainerModule = new ContainerModule(
    (options: ContainerModuleLoadOptions) => {
      options.bind<Ninja>('Ninja').to(Ninja);
    },
  );

  const weaponsModule: ContainerModule = new ContainerModule(
    (options: ContainerModuleLoadOptions) => {
      options.bind<Katana>('Weapon').to(Katana).whenNamed('Melee');
      options.bind<Shuriken>('Weapon').to(Shuriken).whenNamed('Ranged');
    },
  );

  container.load(warriorsModule, weaponsModule);

  const ninja: Ninja = container.get('Ninja');
  // End-example
})();

const ninjaPromise: Promise<Ninja> = scriptExecution.then(() =>
  container.get('Ninja'),
);

export { ninjaPromise };
