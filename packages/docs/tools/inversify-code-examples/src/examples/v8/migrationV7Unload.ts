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

export const container: Container = new Container();

// Begin-example
const weaponsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Katana>('Weapon').to(Katana);
  },
);

container.load(weaponsModule);

// v8: sync unload (default)
container.unload(weaponsModule);

export const isBound: boolean = container.isBound('Weapon'); // false
// End-example
