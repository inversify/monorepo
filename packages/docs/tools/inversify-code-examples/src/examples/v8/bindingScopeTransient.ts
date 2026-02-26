// Is-inversify-import-example
import { Container } from 'inversify8';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).inTransientScope();

const firstKatana: Weapon = container.get<Weapon>('Weapon');
const secondKatana: Weapon = container.get<Weapon>('Weapon');

// Returns false
const isSameKatana: boolean = firstKatana === secondKatana;
// End-example

export { isSameKatana };
