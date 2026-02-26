// Is-inversify-import-example
import { Container, injectable } from 'inversify7';

interface Weapon {
  damage: number;
}

@injectable()
class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v7: sync unbindAll
container.unbindAllSync();

const isBound: boolean = container.isBound('Weapon'); // false
// End-example

export { isBound, Katana };
