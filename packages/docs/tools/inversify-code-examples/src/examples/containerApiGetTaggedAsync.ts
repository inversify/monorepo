// Is-inversify-import-example
import { Container, injectable } from 'inversify6';

interface Weapon {
  readonly damage: number;
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
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Katana())
  .whenTargetTagged('faction', 'samurai');
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Shuriken())
  .whenTargetTagged('faction', 'ninja');

const katana: Promise<Weapon> = container.getTaggedAsync<Weapon>(
  'Weapon',
  'faction',
  'samurai',
);
const shuriken: Promise<Weapon> = container.getTaggedAsync<Weapon>(
  'Weapon',
  'faction',
  'ninja',
);
// End-example

export { katana, shuriken };
