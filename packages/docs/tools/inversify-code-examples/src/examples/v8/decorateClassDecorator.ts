// Is-inversify-import-example
import { Container, decorate, injectable } from 'inversify8';

interface Weapon {
  damage: number;
}

// Begin-example
class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Apply @injectable decorator using decorate function
decorate(injectable(), Katana);

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);

const katana: Weapon = container.get<Weapon>('Weapon');
// End-example

export { katana };
