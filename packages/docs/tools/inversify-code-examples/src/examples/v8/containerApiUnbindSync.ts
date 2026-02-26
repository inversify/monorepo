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

// Create a binding
container.bind<Weapon>('Weapon').to(Katana);

// Check if it's bound
console.log(container.isBound('Weapon')); // true

// Synchronously unbind the service
container.unbind('Weapon');

// Verify it's unbound
console.log(container.isBound('Weapon')); // false
// End-example

export { Katana };
