// Is-inversify-import-example
import { Container, inject, injectable, interfaces } from 'inversify6';

export interface Engine {
  displacement: number;
}

class BaseEngine implements Engine {
  public displacement: number;

  constructor(displacement?: number) {
    this.displacement = displacement ?? 0;
  }
}

export class DieselEngine extends BaseEngine {}

export class PetrolEngine extends BaseEngine {}

interface CarFactory {
  createEngine(displacement: number): Engine;
}

const container: Container = new Container();

// Begin-example
container.bind<Engine>('Engine').to(PetrolEngine).whenTargetNamed('petrol');
container.bind<Engine>('Engine').to(DieselEngine).whenTargetNamed('diesel');

container
  .bind<interfaces.Factory<Engine>>('Factory<Engine>')
  .toFactory<Engine, [string], [number]>((context: interfaces.Context) => {
    return (named: string) => (displacement: number) => {
      const engine: Engine = context.container.getNamed<Engine>(
        'Engine',
        named,
      );
      engine.displacement = displacement;
      return engine;
    };
  });

@injectable()
class DieselCarFactory implements CarFactory {
  readonly #dieselFactory: (displacement: number) => Engine;

  constructor(
    @inject('Factory<Engine>')
    factory: (category: string) => (displacement: number) => Engine, // Injecting an engine factory
  ) {
    // Creating a diesel engine factory
    this.#dieselFactory = factory('diesel');
  }

  public createEngine(displacement: number): Engine {
    // Creating a concrete diesel engine
    return this.#dieselFactory(displacement);
  }
}
// End-example

export { container, DieselCarFactory };
