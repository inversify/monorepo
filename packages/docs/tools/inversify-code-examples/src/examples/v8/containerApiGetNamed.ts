// Is-inversify-import-example
import { Container, injectable } from 'inversify8';

interface Weapon {
  damage: number;
}

@injectable()
export class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).whenNamed('Katana');

const katana: Weapon = container.get<Weapon>('Weapon', { name: 'Katana' });
// End-example

export { katana };
