// Shift-line-spaces-2
import { buildProviderModule, provide } from '@inversifyjs/binding-decorators';
import { Container, inject, injectable, Newable } from 'inversify';

let containerFromExexution: Container;
let ninjaType: Newable;

const scriptExecution: Promise<void> = (async () => {
  // Begin-example
  @injectable()
  @provide()
  class Katana {
    public readonly damage: number = 10;
  }

  @injectable()
  @provide()
  class Ninja {
    constructor(
      @inject(Katana)
      public readonly katana: Katana,
    ) {}
  }

  const container: Container = new Container();

  // Exclude-from-example
  {
    containerFromExexution = container;
    ninjaType = Ninja;
  }

  await container.loadAsync(buildProviderModule());

  const ninja: Ninja = container.get(Ninja);

  console.log(ninja.katana.damage); // Prints 10
  // End-example

  return;
})();

const ninjaPromise: Promise<unknown> = scriptExecution.then(() =>
  containerFromExexution.get(ninjaType),
);

export { ninjaPromise };
