// Is-inversify-import-example
import { Container, injectable } from 'inversify6';

// Begin-example
export class Katana {
  public readonly damage: number = 10;
}

@injectable()
export class Samurai {
  public readonly katana: Katana;

  constructor(katana: Katana) {
    this.katana = katana;
  }
}

const container: Container = new Container({ autoBindInjectable: true });

const samurai: Samurai = container.resolve(Samurai);
// End-example

export { samurai };
