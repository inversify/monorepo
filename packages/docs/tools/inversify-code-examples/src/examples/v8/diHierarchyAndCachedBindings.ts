// Is-inversify-import-example
import { Container, inject, injectable } from 'inversify8';

@injectable()
class Katana {
  public readonly damage: number = 50;
}

@injectable()
class LegendaryKatana extends Katana {
  public override readonly damage: number = 100;
  public readonly isLegendary: boolean = true;
}

// Begin-example

@injectable()
class Samurai {
  constructor(
    @inject(Katana)
    public katana: Katana,
  ) {}
}

const parentContainer: Container = new Container();
parentContainer.bind(Samurai).toSelf().inSingletonScope();
parentContainer.bind(Katana).toSelf();

const childContainer: Container = new Container({ parent: parentContainer });
childContainer.bind(Katana).to(LegendaryKatana);

// The result of this resolution will be cached in the samurai binding
childContainer.get(Samurai);

// This samurai will have a LegendaryKatana injected
const samurai: Samurai = parentContainer.get(Samurai);
// End-example

export { Samurai, LegendaryKatana, samurai };
