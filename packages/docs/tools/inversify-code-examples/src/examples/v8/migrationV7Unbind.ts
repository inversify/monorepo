// Is-inversify-import-example
import { Container, injectable } from 'inversify8';

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

// v8: sync unbind (default)
container.unbind('Weapon');

const isBound: boolean = container.isBound('Weapon'); // false
// End-example

export { isBound, Katana };
