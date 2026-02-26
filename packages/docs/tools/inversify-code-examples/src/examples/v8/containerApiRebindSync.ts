// Is-inversify-import-example
import { Container, injectable } from 'inversify8';

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

// Create initial binding
container.bind<Weapon>('Weapon').to(Katana);

// Get instance of Katana
const katana: Weapon = container.get<Weapon>('Weapon');
console.log(katana.damage); // 10

// Rebind synchronously to Shuriken
// This returns a BindToFluentSyntax to continue configuring the binding
container.rebind<Weapon>('Weapon').to(Shuriken);

// Get instance of Shuriken
const shuriken: Weapon = container.get<Weapon>('Weapon');
console.log(shuriken.damage); // 8
// End-example

export { Katana, Shuriken };
