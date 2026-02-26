// Is-inversify-import-example
import {
  Container,
  ContainerModule,
  ContainerModuleLoadOptions,
  injectable,
} from 'inversify7';

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

const scriptExecution: Promise<void> = (async () => {
  // Begin-example
  const module: ContainerModule = new ContainerModule(
    (options: ContainerModuleLoadOptions) => {
      // v7: sync unbind and rebind
      options.unbindSync('Weapon');
      options.bind<Weapon>('Weapon').to(Shuriken);
    },
  );

  await container.load(module);
  // End-example
})();

export const weaponPromise: Promise<Weapon> = scriptExecution.then(() =>
  container.get<Weapon>('Weapon'),
);
