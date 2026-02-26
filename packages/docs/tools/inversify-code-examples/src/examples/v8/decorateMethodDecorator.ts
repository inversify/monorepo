/* eslint-disable @typescript-eslint/no-magic-numbers */
// Is-inversify-import-example
import { Container, decorate, injectable, postConstruct } from 'inversify8';

interface Weapon {
  damage: number;
}

// Begin-example
@injectable()
class Katana implements Weapon {
  private _damage: number = 10;

  public get damage(): number {
    return this._damage;
  }

  public improve(): void {
    this._damage += 2;
  }
}

// Apply @postConstruct decorator to method using decorate function
decorate(postConstruct(), Katana, 'improve');

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);

const katana: Katana = container.get<Weapon>('Weapon') as Katana;
// End-example

export { katana };
