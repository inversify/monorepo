// Is-inversify-import-example
import { Container, injectable } from 'inversify6';

@injectable()
class Katana {
  public hit() {
    return 'cut!';
  }
}

@injectable()
class Ninja implements Ninja {
  public katana: Katana;

  constructor(katana: Katana) {
    this.katana = katana;
  }

  public fight() {
    return this.katana.hit();
  }
}

const container: Container = new Container();
container.bind(Katana).toSelf();

// Ninja is provided and a Ninja bindong is added to the container
const ninja: Ninja = container.resolve(Ninja);
// End-example

export { ninja };
