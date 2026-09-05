``` ts
import { Container, inject, injectable } from 'inversify';

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

console.log(ninja.katana.damage);
```
