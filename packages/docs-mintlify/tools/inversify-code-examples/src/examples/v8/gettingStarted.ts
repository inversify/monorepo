// Is-inversify-import-example
import { Container, inject, injectable } from 'inversify8';

@injectable()
class Katana {
  public readonly damage: number = 10;
}

@injectable()
class Ninja {
  constructor(
    @inject(Katana)
    public readonly katana: Katana,
  ) {}
}

const container: Container = new Container();

container.bind(Ninja).toSelf();
container.bind(Katana).toSelf();

const ninja: Ninja = container.get(Ninja);

console.log(ninja.katana.damage); // Prints 10
// End-example

export { ninja };
