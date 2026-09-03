``` ts
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

const container: Container = new Container();

container.bind(Katana).toSelf().inSingletonScope();
container.bind(Samurai).toSelf().inSingletonScope();

const samurai: Samurai = container.get(Samurai);
```
