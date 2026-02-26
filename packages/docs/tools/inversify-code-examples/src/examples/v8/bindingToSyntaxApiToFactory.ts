// Is-inversify-import-example
import {
  Container,
  Factory,
  inject,
  injectable,
  ResolutionContext,
} from 'inversify8';

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
container.bind<Engine>('Engine').to(PetrolEngine).whenNamed('petrol');
container.bind<Engine>('Engine').to(DieselEngine).whenNamed('diesel');

container
  .bind<Factory<(displacement: number) => Engine, [string]>>('Factory<Engine>')
  .toFactory((context: ResolutionContext) => {
    return (named: string) => (displacement: number) => {
      const engine: Engine = context.get<Engine>('Engine', {
        name: named,
      });
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
