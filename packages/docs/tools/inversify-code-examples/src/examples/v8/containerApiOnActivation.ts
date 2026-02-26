/* eslint-disable @typescript-eslint/no-magic-numbers */
// Is-inversify-import-example
import { Container, type ResolutionContext } from 'inversify8';

// Begin-example
interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  #damage: number = 10;

  public get damage(): number {
    return this.#damage;
  }

  public improve(): void {
    this.#damage += 2;
  }
}

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.onActivation(
  'Weapon',
  (_context: ResolutionContext, katana: Katana): Katana | Promise<Katana> => {
    katana.improve();

    return katana;
  },
);

// Katana.damage is 12
const katana: Weapon = container.get<Weapon>('Weapon');
// End-example

export { katana };
