/* eslint-disable @typescript-eslint/no-magic-numbers */
// Is-inversify-import-example
import { Container, postConstruct } from 'inversify8';

// Begin-example
interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  #damage: number = 10;

  public get damage(): number {
    return this.#damage;
  }

  @postConstruct()
  public improve(): void {
    this.#damage += 2;
  }
}

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);

// Katana.damage is 12
const katana: Weapon = container.get<Weapon>('Weapon');
// End-example

export { katana };
