/* eslint-disable @typescript-eslint/no-unused-vars */
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
export class Ninja {
  @inject('Weapon')
  @named('Melee')
  public readonly weapon!: Weapon;
}

export const container: Container = new Container();

// Begin-example
const weaponsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Katana>('Weapon').to(Katana).whenNamed('Melee');
  },
);

// v8: sync load (default)
container.load(weaponsModule);

container.bind(Ninja).toSelf();

const ninja: Ninja = container.get(Ninja);
// End-example
