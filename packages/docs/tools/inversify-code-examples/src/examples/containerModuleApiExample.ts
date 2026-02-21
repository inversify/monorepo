// Is-inversify-import-example
import {
  Container,
  ContainerModule,
  inject,
  injectable,
  interfaces,
  named,
} from 'inversify6';

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

// Begin-example
const warriorsModule: ContainerModule = new ContainerModule(
  (bind: interfaces.Bind) => {
    bind<Ninja>('Ninja').to(Ninja);
  },
);

const weaponsModule: ContainerModule = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind,
    _unbindAsync: interfaces.UnbindAsync,
    _onActivation: interfaces.Container['onActivation'],
    _onDeactivation: interfaces.Container['onDeactivation'],
  ) => {
    bind<Katana>('Weapon').to(Katana).whenTargetNamed('Melee');
    bind<Shuriken>('Weapon').to(Shuriken).whenTargetNamed('Ranged');
  },
);

const container: Container = new Container();
container.load(warriorsModule, weaponsModule);

const ninja: Ninja = container.get('Ninja');
// End-example

export { ninja };
