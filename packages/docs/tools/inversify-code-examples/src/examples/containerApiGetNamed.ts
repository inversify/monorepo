// Is-inversify-import-example
import { Container, injectable } from 'inversify6';

interface Weapon {
  readonly damage: number;
}

@injectable()
export class Katana implements Weapon {
  public readonly damage: number = 10;
}

@injectable()
export class Shuriken implements Weapon {
  public readonly damage: number = 5;
}

// Begin-example
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).whenTargetNamed('melee');
container.bind<Weapon>('Weapon').to(Shuriken).whenTargetNamed('ranged');

const katana: Weapon = container.getNamed<Weapon>('Weapon', 'melee');
const shuriken: Weapon = container.getNamed<Weapon>('Weapon', 'ranged');
// End-example

export { katana, shuriken };
