// Is-inversify-import-example
import { Container, injectable, unmanaged } from 'inversify8';

@injectable()
class Base {
  public prop: string;
  constructor(@unmanaged() arg: string) {
    this.prop = arg;
  }
}

@injectable()
class Derived extends Base {
  constructor() {
    super('inherited-value');
  }
}

const container: Container = new Container();

container.bind(Derived).toSelf();

const derived: Derived = container.get(Derived);

// Returns 'inherited-value'
const derivedProp: string = derived.prop;
// End-example

export { derivedProp };
