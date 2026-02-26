// Is-inversify-import-example
import { Container, injectable } from 'inversify7';

interface Weapon {
  damage: number;
}

@injectable()
class Katana implements Weapon {
  public readonly damage: number = 10;
}

@injectable()
class Shuriken implements Weapon {
  public readonly damage: number = 8;
}

// Begin-example
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v7: sync rebind
container.rebindSync<Weapon>('Weapon').to(Shuriken);

const weapon: Weapon = container.get<Weapon>('Weapon');
// End-example

export { Katana, Shuriken, weapon };
