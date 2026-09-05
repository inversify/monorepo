``` ts
import { Container, injectable, unmanaged } from 'inversify';

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

const derived: Derived = container.resolve(Derived);

// Returns 'inherited-value'
const derivedProp: string = derived.prop;
```
