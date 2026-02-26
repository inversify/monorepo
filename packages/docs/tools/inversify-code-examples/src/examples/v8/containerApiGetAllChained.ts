// Is-inversify-import-example
import { Container, injectable } from 'inversify8';

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

// Begin-example

const parentContainer: Container = new Container();

const container: Container = new Container({
  parent: parentContainer,
});

parentContainer.bind<Weapon>('Weapon').to(Katana);
container.bind<Weapon>('Weapon').to(Shuriken);

// returns Weapon[] with both Katana and Shuriken instances
const weapons: Weapon[] = container.getAll<Weapon>('Weapon', { chained: true });

// End-example

export { weapons };
