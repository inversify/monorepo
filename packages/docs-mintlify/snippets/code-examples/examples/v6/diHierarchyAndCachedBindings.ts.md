``` ts
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

const childContainer: Container = parentContainer.createChild();
childContainer.bind(Katana).to(LegendaryKatana);

// The result of this resolution will be cached in the samurai binding
childContainer.get(Samurai);

// This samurai will have a LegendaryKatana injected
const samurai: Samurai = parentContainer.get(Samurai);
```
