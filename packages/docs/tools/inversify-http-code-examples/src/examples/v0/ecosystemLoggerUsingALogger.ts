import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { inject, injectable } from 'inversify';

// Exclude-from-example
class MyAwesomeDependency {
  public doSomething() {}
}

@injectable()
export class MyAwesomeService {
  readonly #logger: Logger;
  readonly #myAwesomeDependency: MyAwesomeDependency;

  constructor(
    @inject(MyAwesomeDependency)
    myAwesomeDependency: MyAwesomeDependency,
  ) {
    this.#logger = new ConsoleLogger('MyAwesomeService');
    this.#myAwesomeDependency = myAwesomeDependency;
  }

  public doSomethingAwesome() {
    this.#logger.info('Doing something awesome!');
    this.#myAwesomeDependency.doSomething();
  }
}
