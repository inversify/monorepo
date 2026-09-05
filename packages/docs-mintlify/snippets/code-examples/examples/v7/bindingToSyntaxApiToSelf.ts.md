``` ts
const container: Container = new Container();
container.bind<Weapon>(Katana).toSelf();

const katana: Weapon = container.get<Weapon>(Katana);
```
