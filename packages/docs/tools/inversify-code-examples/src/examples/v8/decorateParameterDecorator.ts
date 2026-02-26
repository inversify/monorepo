// Is-inversify-import-example
import { Container, decorate, inject, injectable } from 'inversify8';

interface Weapon {
  damage: number;
}

@injectable()
class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
@injectable()
class Warrior {
  private readonly weapon: Weapon;

  constructor(weapon: Weapon) {
    this.weapon = weapon;
  }

  public fight(): string {
    return `Fighting with weapon damage: ${this.weapon.damage.toString()}`;
  }
}

// Apply @inject decorator to constructor parameter using decorate function
decorate(inject('Weapon'), Warrior, 0);

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.bind<Warrior>('Warrior').to(Warrior);

const warrior: Warrior = container.get<Warrior>('Warrior');
// End-example

export { warrior };
