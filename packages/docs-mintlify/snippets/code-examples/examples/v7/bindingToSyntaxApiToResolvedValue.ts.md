``` ts
const container: Container = new Container();

container.bind(Katana).toSelf();
container
  .bind<Weapon>('Weapon')
  .toResolvedValue((weapon: Weapon): Weapon => weapon, [Katana]);

const katana: Weapon = container.get<Weapon>('Weapon');
```
