// Is-inversify-import-example
import {
  Container,
  ContainerModule,
  ContainerModuleLoadOptions,
  injectable,
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
  public readonly damage: number = 8;
}

export const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// Begin-example
const module: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // v8: sync unbind and rebind (default)
    options.unbind('Weapon');
    options.bind<Weapon>('Weapon').to(Shuriken);
  },
);

container.load(module);
// End-example
