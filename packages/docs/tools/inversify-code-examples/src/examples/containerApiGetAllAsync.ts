// Is-inversify-import-example
import { Container, injectable } from 'inversify6';

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
const container: Container = new Container();
container.bind<Weapon>('Weapon').toDynamicValue(async () => new Katana());
container.bind<Weapon>('Weapon').to(Shuriken);

const weapons: Promise<Weapon[]> = container.getAllAsync<Weapon>('Weapon');
// End-example

export { weapons };
