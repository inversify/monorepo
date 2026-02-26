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

// Rebind asynchronously to Shuriken
async function rebindWeapon() {
  // First unbind the existing service
  container.unbind('Weapon');

  // Then bind to the new service
  container.bind<Weapon>('Weapon').to(Shuriken);

  // Get instance of Shuriken
  const shuriken: Weapon = container.get<Weapon>('Weapon');
  console.log(shuriken.damage); // 8
}

// Call the async function
void rebindWeapon();
// End-example

export { Katana, Shuriken };
