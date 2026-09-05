``` ts
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).inSingletonScope();
```
