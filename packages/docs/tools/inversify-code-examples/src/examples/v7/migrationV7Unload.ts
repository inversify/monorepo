/* eslint-disable @typescript-eslint/no-unused-vars */
// Shift-line-spaces-2
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

export const container: Container = new Container();

const scriptExecution: Promise<void> = (async () => {
  // Begin-example
  const weaponsModule: ContainerModule = new ContainerModule(
    (options: ContainerModuleLoadOptions) => {
      options.bind<Katana>('Weapon').to(Katana);
    },
  );

  await container.load(weaponsModule);

  // v7: sync unload
  container.unloadSync(weaponsModule);

  const isBound: boolean = container.isBound('Weapon'); // false
  // End-example
})();

export const isBoundPromise: Promise<boolean> = scriptExecution.then(() =>
  container.isBound('Weapon'),
);
