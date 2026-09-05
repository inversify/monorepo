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

const samurai: Samurai = container.get(Samurai, { autobind: true });
```
